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

    try {
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
    } catch (error) {
      this.logger.error(
        `Error proxying ${method} request to ${serviceName}: ${url}`,
      )
      throw error
    }
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
}
