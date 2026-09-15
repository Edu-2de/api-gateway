import { AppService } from '@/app.service'
import { ProxyService } from '@/proxy/proxy.service'
import { Controller, Get } from '@nestjs/common'

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private proxyService: ProxyService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }
}
