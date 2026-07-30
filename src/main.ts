import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { Env } from './env/env'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(helmet())

  const configService = app.get<ConfigService<Env, true>>(ConfigService)
  const port = configService.get('PORT', { infer: true }) || 3005
  const corsOrigin = configService.get('CORS_ORIGIN', { infer: true }) || '*'

  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )

  const config = new DocumentBuilder()
    .setTitle('MarketPlace Api Gateway')
    .setDescription('Api Gateway for Marketplace Microservices')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  await app.listen(port)

  console.log(`API GATEWAY RUNNING ON PORT ${port}`)
  console.log(`SWAGGER DOCUMENTATION: http://localhost:${port}/api`)
}
bootstrap()
