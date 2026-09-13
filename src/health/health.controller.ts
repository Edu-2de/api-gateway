import { HealthCheckService } from '@/common/health/health-check.service'
import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { HealthService } from './health.service'

@Controller()
export class HealthController {
  constructor(
    private healthService: HealthService,
    private healthCheckService: HealthCheckService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Healthy check to gateway' })
  @ApiResponse({ status: 200, description: 'Gateway está saudável' })
  async getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
    }
  }

  async getServicesHealth() {
    const services = await this.healthCheckService.checkAllServices()

    const overallStatus = services.every(
      (service) => service.status === 'healthy',
    )
      ? 'healthy'
      : services.some((service) =>
          service.status === 'healthy' ? 'degraded' : 'unhealthy',
        )
  }
}
