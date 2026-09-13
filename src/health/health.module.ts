import { HealthCheckService } from '@/common/health/health-check.service'
import { Module } from '@nestjs/common'
import { HealthController } from './health.controller'
import { HealthService } from './health.service'

@Module({
  imports: [HealthCheckService],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
