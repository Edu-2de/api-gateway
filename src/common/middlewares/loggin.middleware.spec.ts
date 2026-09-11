import { LogginMiddleware } from '../health/loggin.middleware'

describe('LogginMiddleware', () => {
  it('should be defined', () => {
    expect(new LogginMiddleware()).toBeDefined()
  })
})
