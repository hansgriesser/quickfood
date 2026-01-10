import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isHashed = user.password.startsWith('$2');
    const ok = isHashed
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      access_token: await this.jwt.signAsync(payload),
    };
  }
}
