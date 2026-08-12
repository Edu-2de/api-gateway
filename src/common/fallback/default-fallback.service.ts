import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class DefaultFallbackService {
  private readonly logger = new Logger(DefaultFallbackService.name)
}
