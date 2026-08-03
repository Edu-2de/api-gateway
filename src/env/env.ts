import z from 'zod'

export const envSchema = z.object({
  PORT: z.coerce.number().default(3005),
  JWT_SECRET: z.string(),
  USERS_SERVICE_URL: z.url(),
  PRODUCTS_SERVICE_URL: z.url(),
  CHECKOUT_SERVICE_URL: z.url(),
  PAYMENTS_SERVICE_URL: z.url(),
  CORS_ORIGIN: z.string(),
  RATE_LIMIT_SHORT: z.string().optional().default('10').transform(Number),
  RATE_LIMIT_MEDIUM: z.string().optional().default('60000').transform(Number),
  RATE_LIMIT_LONG: z.string().optional().default('900000').transform(Number),
})

export type Env = z.infer<typeof envSchema>
