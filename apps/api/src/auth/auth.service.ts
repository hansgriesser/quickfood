import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from 'bcrypt';
import { Role } from '@generated/prisma/enums';

import { ActivityService } from '../activity/activity.service';
import { ActivityType } from '@generated/prisma/enums';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly activity: ActivityService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isHashed = user.password.startsWith('$2');
    const ok = isHashed
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!ok) throw new UnauthorizedException('Invalid credentials');

    await this.activity.log({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      type: ActivityType.AUTH_LOGIN_SUCCESS,
      actorId: user.id,
      targetType: null,
      targetId: null,
      meta: { username: user.username },
    });

    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      access_token: await this.jwt.signAsync(payload),
    };
  }
  async register(username: string, password: string, roleRaw: string) {
    const role = this.normalizeRole(roleRaw);

    if (!username?.trim())
      throw new BadRequestException('Username cannot be empty');
    if (!password?.trim())
      throw new BadRequestException('Password cannot be empty');

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          username: username.trim(),
          password: passwordHash,
          role,
        },
        select: { id: true, username: true, role: true },
      });

      await this.activity.log({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        type: ActivityType.AUTH_REGISTER,
        actorId: user.id,
        meta: { username: user.username, role: user.role },
        targetType: null,
        targetId: null,
      });

      const payload = {
        sub: user.id,
        username: user.username,
        role: user.role,
      };
      return {
        access_token: await this.jwt.signAsync(payload),
        user,
      };
    } catch (e: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (e.code === 'P2002') {
        throw new ConflictException('Username already taken');
      }
      throw e;
    }
  }

  private normalizeRole(roleRaw: string): Role {
    const r = (roleRaw || '').toLocaleUpperCase().trim();
    if (r === 'OWNER') return Role.OWNER;
    if (r === 'USER') return Role.USER;
    throw new BadRequestException('Role must be USER or OWNER');
  }
}
