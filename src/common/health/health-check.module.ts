import { CircuitBreakerModule } from '@/common/circuit-breaker/circuit-breaker.module'
import { EnvModule } from '@/env/env.module'
import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { HealthCheckService } from './health-check.service'

@Module({
  imports: [HttpModule, CircuitBreakerModule, EnvModule],
  providers: [HealthCheckService],
  exports: [HealthCheckService],
})
export class HealthCheckModule {}
