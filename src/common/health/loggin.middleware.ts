import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class LogginMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP')

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req
    const userAgent = req.get('User-agent') || ''
    const startTime = Date.now()

    let isFinished = false

    this.logger.log(
      `Incoming Request: ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`,
    )

    res.on('finish', () => {
      isFinished = true

      const { statusCode } = res
      const contentLength = res.get('Content-Length')
      const duration = Date.now() - startTime

      this.logger.log(
        `Outgoing Response: ${method} ${originalUrl} - ${statusCode} - ${contentLength || 0}b - ${duration}ms`,
      )
      if (statusCode >= 400) {
        this.logger.error(
          `Error Response: ${method} ${originalUrl} - ${statusCode} - ${duration}ms`,
        )
      }
    })

    res.on('error', (error: Error) => {
      this.logger.error(
        `Response Erro: ${method} ${originalUrl} - ${error.message}`,
      )
    })

    res.on('close', () => {
      if (!isFinished) {
        this.logger.warn(
          `Request Closed/Timeout: ${method} ${originalUrl} - ${Date.now()}`,
        )
      }
    })

    next()
  }
}
