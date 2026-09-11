import { serviceConfig } from '@/config/gateway.config'
import { EnvService } from '@/env/env.service'
import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { firstValueFrom, timeout } from 'rxjs'
import { CircuitBreakerService } from '../circuit-breaker/circuit-breaker.service'
import { HealthService, ServiceHealth } from './health-check'

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name)
  private readonly healthCache = new Map<string, ServiceHealth>()

  constructor(
    private readonly httpService: HttpService,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly envService: EnvService,
  ) {}

  async checkServiceHealth(
    serviceName: keyof ReturnType<typeof serviceConfig>,
  ): Promise<ServiceHealth> {
    const config = serviceConfig(this.envService)
    const service = config[serviceName]
    const startTime = Date.now()

    try {
      await this.circuitBreakerService.executeWithCircuitBreaker(
        `health-${String(serviceName)}`,

        undefined,

        async () => {
          const response = await firstValueFrom(
            this.httpService
              .get(`${service.url}/health`, {
                timeout: service.timeout,
              })
              .pipe(timeout(service.timeout)),
          )
          return response.status
        },

        async () => {
          throw new Error('Circuit breaker fallback')
        },
      )

      const responseTime = Date.now() - startTime
      const serviceHealth: ServiceHealth = {
        name: serviceName as string,
        url: service.url,
        status: HealthService.HEALTHY,
        responseTime,
        lastCheck: new Date(),
      }

      this.healthCache.set(serviceName as string, serviceHealth)

      return serviceHealth
    } catch (error) {
      const responseTime = Date.now() - startTime
      const serviceHealth: ServiceHealth = {
        name: serviceName as string,
        url: service.url,
        status: HealthService.UNHEALTHY,
        responseTime,
        lastCheck: new Date(),
      }

      this.healthCache.set(serviceName as string, serviceHealth)

      const errorMessage =
        error instanceof Error ? error.message : String(error)
      this.logger.error(
        `Health check failed for ${String(serviceName)}: ${errorMessage}`,
      )

      return serviceHealth
    }
  }

  async checkAllServices(): Promise<ServiceHealth[]> {
    const services: (keyof ReturnType<typeof serviceConfig>)[] = [
      'users',
      'products',
      'checkout',
      'payments',
    ]

    const healthChecks = await Promise.allSettled(
      services.map((serviceName) => this.checkServiceHealth(serviceName)),
    )

    return healthChecks.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          name: services[index],
          url: serviceConfig[services[index]].url,
          status: HealthService.UNHEALTHY as const,
          responseTime: 0,
          lastCheck: new Date(),
          error: result.reason?.message || 'Unknown error',
        }
      }
    })
  }

  getCheckedHealth(serviceName: string): ServiceHealth | undefined {
    return this.healthCache.get(serviceName)
  }

  getAllcheckedHealth(): ServiceHealth[] {
    return [...this.healthCache.values()]
  }
}
