import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { EnvService } from '../../env/env.service'

export interface TokenPayload {
  sub: string
  email: string
  role: string
  token: string
  initiatedAt?: number
  expireIn: number
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private envService: EnvService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: envService.get('JWT_SECRET'),
    })
  }

  async validate(payload: TokenPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    }
  }
}
