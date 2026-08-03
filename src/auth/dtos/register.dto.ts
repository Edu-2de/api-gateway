import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

enum Role {
  USER = 'user',
  ADMIN = 'admin',
  SELLER = 'seller',
}

export abstract class RegisterDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'user@example.com',
  })
  @IsEmail()
  abstract email: string

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  abstract password: string

  @ApiProperty({
    description: 'Primeiro nome do usuário',
    example: 'John',
  })
  @IsString()
  abstract firstName: string

  @ApiProperty({
    description: 'Último nome do usuário',
    example: 'Doe',
  })
  @IsString()
  abstract lastName: string

  @ApiProperty({
    description: 'Role do usuário',
    example: Role.USER,
  })
  @IsOptional()
  @IsString()
  abstract role?: Role
}
