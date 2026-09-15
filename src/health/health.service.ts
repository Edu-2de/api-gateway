import { HealthStatus } from '@/common/health/health-check'
import { HealthCheckService } from '@/common/health/health-check.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class HealthService {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  async getHealthStatus() {
    const healthChecks = await this.healthCheckService.checkAllServices()

    const results = {
      status: HealthStatus.HEALTHY,
      timestamp: new Date().toISOString(),
      gateway: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
      services: {},
    }

    let hasUnhealthyServices = false

    healthChecks.forEach((serviceHealth) => {
      results.services[serviceHealth.name] = {
        status: serviceHealth.status,
        responseTime: serviceHealth.status,
        lastCheck: serviceHealth.lastCheck,
        url: serviceHealth.url,
        ...(serviceHealth.error && { error: serviceHealth.error }),
      }

      if (serviceHealth.status === HealthStatus.UNHEALTHY) {
        hasUnhealthyServices = true
      }
    })

    if (hasUnhealthyServices) {
      results.status = HealthStatus.DEGRADED
    }

    return results
  }

  async getReadyStatus() {
    const healthStatus = await this.getHealthStatus()

    return {
      status:
        healthStatus.status === HealthStatus.HEALTHY ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
    }
  }

  async getLiveStatus() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }
  }
}
