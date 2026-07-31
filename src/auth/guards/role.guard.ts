import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRoles) return true

    const user = context.switchToHttp().getRequest().user
    if (!user || !user.role) throw new ForbiddenException('User not found')

    const hasRole = requiredRoles.includes(user.role)
    if (!hasRole) throw new ForbiddenException('Access denied')

    return true
  }
}
