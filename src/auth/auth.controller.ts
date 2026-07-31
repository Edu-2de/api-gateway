import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: { email: string; password: string }) {
    return this.authService.login(loginDto)
  }

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'User regiter' })
  @ApiResponse({ status: 201, description: 'Register successful' })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  async register(@Body() registerDto: { email: string; password: string }) {
    return this.authService.register(registerDto)
  }
}
