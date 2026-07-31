import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { envSchema } from './env/env'
import { EnvModule } from './env/env.module'
import { LogginMiddleware } from './middleware/loggin.middleware'
import { MiddlewareModule } from './middleware/middleware.module'
import { ProxyModule } from './proxy/proxy.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, //1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    EnvModule,
    ProxyModule,
    MiddlewareModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogginMiddleware).forRoutes('*')
  }
}
