import { Module } from '@nestjs/common'
import { EnvModule } from '../env/env.module'
import { ProxyService } from './proxy.service'

@Module({
  imports: [EnvModule],
  providers: [ProxyService],
  exports: [ProxyService],
})
export class ProxyModule {}
