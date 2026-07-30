import { EnvService } from '../env/env.service'

export function serviceConfig(env: EnvService) {
  return {
    users: {
      url: env.get('USERS_SERVICE_URL'),
      timeout: 10000,
    },
    products: {
      url: env.get('PRODUCTS_SERVICE_URL'),
      timeout: 10000,
    },
    checkout: {
      url: env.get('CHECKOUT_SERVICE_URL'),
      timeout: 10000,
    },
    payments: {
      url: env.get('PAYMENTS_SERVICE_URL'),
      timeout: 10000,
    },
  } as const
}
