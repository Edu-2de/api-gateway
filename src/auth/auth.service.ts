import { HttpService } from '@nestjs/axios'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { firstValueFrom } from 'rxjs'
import { serviceConfig } from '../config/gateway.config'
import { EnvService } from '../env/env.service'
import { LoginDto } from './dtos/login.dto'
import { RegisterDto } from './dtos/register.dto'

export interface UserSession {
  valid: boolean
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    status: string
  } | null
}

export interface AuthResponse {
  accessToken: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
  }
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private httpService: HttpService,
    private envService: EnvService,
  ) {}

  async validateJwtToken(token: string): Promise<AuthResponse> {
    try {
      return this.jwtService.verify(token)
    } catch (error) {
      throw new UnauthorizedException('Invalid JWT token')
    }
  }

  async validateSessionToken(sessionToken: string): Promise<UserSession> {
    try {
      const config = serviceConfig(this.envService)
      const service = config['users']
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${service.url}/sessions/validate/${sessionToken}`,
          { timeout: service.timeout },
        ),
      )
      return data
    } catch (error) {
      throw new UnauthorizedException('Invalid Session token')
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      const config = serviceConfig(this.envService)
      const service = config['users']
      const { data } = await firstValueFrom(
        this.httpService.post(`${service.url}/login`, loginDto, {
          timeout: service.timeout,
        }),
      )
      return data
    } catch (error) {
      throw new UnauthorizedException('Invalid login credentials')
    }
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      const config = serviceConfig(this.envService)
      const service = config['users']
      const { data } = await firstValueFrom(
        this.httpService.post(`${service.url}/auth/register`, registerDto, {
          timeout: service.timeout,
        }),
      )
      return data
    } catch (error) {
      throw new UnauthorizedException('Registration failed')
    }
  }
}
