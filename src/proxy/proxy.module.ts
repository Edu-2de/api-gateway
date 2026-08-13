import { CircuitBreakerModule } from '@/common/circuit-breaker/circuit-breaker.module'
import { FallbackModule } from '@/common/fallback/fallback.module'
import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { EnvModule } from '../env/env.module'
import { ProxyService } from './proxy.service'

@Module({
  imports: [EnvModule, HttpModule, CircuitBreakerModule, FallbackModule],
  providers: [ProxyService],
  exports: [ProxyService],
})
export class ProxyModule {}
