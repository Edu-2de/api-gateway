import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule } from '@nestjs/throttler'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { CustomThrottlerGuard } from './common/guards/throttler.guard'
import { LogginMiddleware } from './common/middlewares/loggin.middleware'
import { MiddlewareModule } from './common/middlewares/middleware.module'
import { envSchema } from './env/env'
import { EnvModule } from './env/env.module'
import { ProxyModule } from './proxy/proxy.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          name: 'short',
          ttl: 1000, // 1second
          limit: configService.get<number>('RATE_LIMIT_SHORT')!,
        },
        {
          name: 'medium',
          ttl: 60000, // 1 minute
          limit: configService.get<number>('RATE_LIMIT_MEDIUM')!,
        },
        {
          name: 'long',
          ttl: 900000, // 15 minutes
          limit: configService.get<number>('RATE_LIMIT_LONG')!,
        },
      ],
      inject: [ConfigService],
    }),
    EnvModule,
    ProxyModule,
    MiddlewareModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogginMiddleware).forRoutes('*')
  }
}
