import { Module } from '@nestjs/common'
import { CacheFallabackService } from './cache-fallback.service'
import { DefaultFallbackService } from './default-fallback.service'

@Module({
  imports: [],
  providers: [DefaultFallbackService, CacheFallabackService],
  exports: [DefaultFallbackService, CacheFallabackService],
})
export class FallbackModule {}
