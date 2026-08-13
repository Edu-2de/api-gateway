import { CircuitBreakerService } from '@/common/circuit-breaker/circuit-breaker.service'
import { CacheFallabackService } from '@/common/fallback/cache-fallback.service'
import { DefaultFallbackService } from '@/common/fallback/default-fallback.service'
import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { Method } from 'axios'
import { firstValueFrom } from 'rxjs'
import { serviceConfig } from '../config/gateway.config'
import { EnvService } from '../env/env.service'

export interface ProxyUserInfo {
  userId?: string
  email?: string
  role?: string
}

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name)

  constructor(
    private readonly httpService: HttpService,
    private readonly envService: EnvService,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly cacheFallbackService: CacheFallabackService,
    private readonly defaultFallbackService: DefaultFallbackService,
  ) {}

  async proxyRequest(
    serviceName: keyof ReturnType<typeof serviceConfig>,
    method: Method,
    path: string,
    data?: unknown,
    headers?: Record<string, string>,
    userInfo?: ProxyUserInfo,
  ) {
    const config = serviceConfig(this.envService)
    const service = config[serviceName]
    const url = `${service.url}${path}`

    this.logger.log(`Proxying ${method} request to ${serviceName}: ${url}`)

    const fallback = this.defaultFallbackService.createDefaultFallback

    return this.circuitBreakerService.executeWithCircuitBreaker(
      `proxy-${serviceName}`,

      { failureThreshold: 3, timeout: 30000, resetTimeout: 30000 },

      async () => {
        const enhancedHeaders = {
          ...headers,
          'x-user-id': userInfo?.userId ?? '',
          'x-user-email': userInfo?.email ?? '',
          'x-user-role': userInfo?.role ?? '',
        }

        const response = await firstValueFrom(
          this.httpService.request({
            method,
            url,
            data,
            headers: enhancedHeaders,
            timeout: service.timeout,
          }),
        )
        return response
      },

      () => {
        throw new Error(
          `${String(serviceName)} service is temporarily unavailable`,
        )
      },
    )
  }

  async getServiceHealth(serviceName: keyof ReturnType<typeof serviceConfig>) {
    try {
      const config = serviceConfig(this.envService)
      const service = config[serviceName]
      const response = await firstValueFrom(
        this.httpService.get(`${service.url}/health`, {
          timeout: 3000,
        }),
      )
      return { status: `healthy`, data: response.data }
    } catch (error) {
      return { status: 'unhealthy', error: (error as Error).message }
    }
  }

  private createServiceFallback(
    serviceName: string,
    method: string,
    path: string,
  ) {
    switch (serviceName) {
      case 'users':
        if (path.includes('/auth/login')) {
          return this.defaultFallbackService.createErrorFallback(
            'users',
            'Authentication service unavailable',
          )
        }
      case 'product':
        if (method.toLowerCase() === 'get') {
          return this.cacheFallbackService.createCacheFallback(
            `products-${path}`,
            { products: [], total: 0, page: 1, limit: 10 },
          )
        }
        return this.defaultFallbackService.createDefaultFallback(
          'products',
          'Product service unavailable',
        )
      case 'checkout':
      case 'payments':
      default:
        return this.defaultFallbackService.createErrorFallback(
          serviceName,
          `Service unavailable`,
        )
    }
  }
}
