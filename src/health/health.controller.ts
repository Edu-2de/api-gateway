import { HealthCheckService } from '@/common/health/health-check.service'
import { Controller, Get, Param } from '@nestjs/common'
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

  @Get('services')
  @ApiOperation({ summary: 'Health check de todos os servicso' })
  @ApiResponse({ status: 200, description: 'Status de todos os servicos' })
  async getServicesHealth() {
    const services = await this.healthCheckService.checkAllServices()

    const overallStatus = services.every(
      (service) => service.status === 'healthy',
    )
      ? 'healthy'
      : services.some((service) =>
          service.status === 'healthy' ? 'degraded' : 'unhealthy',
        )
    return {
      overallStatus,
      timestamp: new Date().toISOString(),
      services,
      summary: {
        total: services.length,
        healthy: services.filter((s) => s.status === 'healthy').length,
        unhealthy: services.filter((s) => s.status === 'unhealthy').length,
        degraded: services.filter((s) => s.status === 'degraded').length,
      },
    }
  }

  @Get('services/:serviceName')
  @ApiOperation({ summary: 'Heatlhy check de um servico' })
  async getServiceHealth(@Param('serviceName') serviceName: string) {
    const cached = this.healthCheckService.getCheckedHealth(serviceName)

    if (!cached) {
      return {
        status: 'unknown',
        message: 'Service not found or never checked',
        timestamp: new Date().toISOString(),
      }
    }
  }

  @Get('ready')
  @ApiOperation({ summary: 'Get readiness status' })
  @ApiResponse({
    status: 200,
    description: 'Readiness status retrieved successfully',
  })
  async getReady() {
    return this.healthService.getReadyStatus()
  }

  @Get('live')
  @ApiOperation({ summary: 'Get live status' })
  @ApiResponse({
    status: 200,
    description: 'Liveness status retrieved successfully',
  })
  async getLive() {
    return this.healthService.getLiveStatus()
  }
}
