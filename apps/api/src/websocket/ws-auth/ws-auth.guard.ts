import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedSocket } from '../ws.type';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/requests/auth.requests';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();

    const token =
      client.handshake.auth?.token ||
      this.extractTokenFromHeader(client.handshake.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Missing auth token');
    }

    try {
      const payload: JwtPayload = this.jwtService.verify(token);

      client.data.userId = payload.sub;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(authorization?: string): string | undefined {
    if (!authorization) return undefined;

    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
