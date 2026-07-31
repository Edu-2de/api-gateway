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

  @Get('health')
  async getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        users: await this.proxyService.getServiceHealth('users'),
        products: await this.proxyService.getServiceHealth('products'),
        checkout: await this.proxyService.getServiceHealth('checkout'),
        payments: await this.proxyService.getServiceHealth('payments'),
      },
    }
  }
}
