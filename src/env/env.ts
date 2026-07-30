import z from 'zod'

export const envSchema = z.object({
  PORT: z.coerce.number(),
  JWT_SECRET: z.string(),
  USERS_SERVICE_URL: z.url(),
  PRODUCTS_SERVICE_URL: z.url(),
  CHECKOUT_SERVICE_URL: z.url(),
  PAYMENTS_SERVICE_URL: z.url(),
  CORS_ORIGIN: z.string(),
})

export type Env = z.infer<typeof envSchema>
