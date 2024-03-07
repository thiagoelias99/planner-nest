import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { JwtPayload } from '../resources/auth/auth.service'
import { Request } from 'express'

export interface UserRequest extends Request {
  user: JwtPayload
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) { }

  async canActivate(context: ExecutionContext,): Promise<boolean> {
    const request = context.switchToHttp().getRequest<UserRequest>()
    const token = this.extractTokenFromHeader(request)

    if (!token) { throw new UnauthorizedException('Invalid JWT token') }

    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token)
      request.user = payload
      return true
    } catch (error) {
      throw new UnauthorizedException('Invalid JWT token')
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}