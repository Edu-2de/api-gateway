import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { Env } from './env/env'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  )

  const configService = app.get<ConfigService<Env, true>>(ConfigService)
  const port = configService.get('PORT', { infer: true })
  const corsOrigin = configService.get('CORS_ORIGIN', { infer: true })

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) return callback(null, true)
      const allowedOrigins = corsOrigin?.split(',') || ['*']

      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accpet',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
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
    .setDescription(`Api Gateway for Marketplace Microservices`)
    .setVersion('1.0')
    .setContact(
      'MarketPlace Team',
      'https://marketplace.com',
      'dev@marketplace.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JwtAuthGuard',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-session-token',
        in: 'header',
        description: 'Session token for user validation',
      },
      'session-auth',
    )
    .addTag('Authentication', 'Endpoints de autenticação')
    .addTag('Users', 'Endpoints para gestão de usuários')
    .addTag('Products', 'Endpoints para catálago de produtos')
    .addTag('Checkout', 'Endpoints para carrinho e pedidos')
    .addTag('Payments', 'Endpoints para processamento de pagamentos')
    .addTag('Health', 'Endpoints para monitoramento de saúde')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {},
    customSiteTitle: 'Marketplace API Gateway Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `swagger-ui .topbar {display: none}`,
  })

  await app.listen(port)

  console.log(`API GATEWAY RUNNING ON PORT ${port}`)
  console.log(`SWAGGER DOCUMENTATION: http://localhost:${port}/api`)
}
bootstrap()
