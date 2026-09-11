export enum HealthService {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
  DEGRADED = 'degraded',
}

export interface ServiceHealth {
  name: string
  url: string
  status: HealthService
  responseTime: number
  lastCheck: Date
  error?: Error
}
