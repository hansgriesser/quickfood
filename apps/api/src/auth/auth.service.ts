import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from 'bcrypt';
import { Role } from '@generated/prisma/enums';

import { ActivityService } from '../activity/activity.service';
import { ActivityType } from '@generated/prisma/enums';
import { Prisma } from '@generated/prisma/client';
import { JwtPayload } from './jwt-payload.type';

const PRISMA_ERROR_UNIQUE_CONSTRAINT = 'P2002';

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

    if (user.isSuspended) {
      const now = new Date();
      const suspendedUntil = user.suspendedUntil;
      if (suspendedUntil === null || suspendedUntil > now) {
        throw new ForbiddenException('Ihr Account wurde gesperrt');
      }
    }
    const isHashed = user.password.startsWith('$2');
    const ok = isHashed
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!ok) throw new UnauthorizedException('Invalid credentials');

    await this.activity.log({
      type: ActivityType.AUTH_LOGIN_SUCCESS,
      actorId: user.id,
      targetType: null,
      targetId: null,
      meta: { username: user.username },
    });

    const payload = { id: user.id, username: user.username, role: user.role };
    const access_token = await this.generateJwt(payload);

    return { access_token: access_token };
  }

  async generateJwt(user: { id: number; username: string; role: Role }) {
    const token = await this.jwt.signAsync(user);
    console.log(token);
    return token;
  }

  async register(username: string, password: string, roleRaw: string) {
    const role = this.normalizeRole(roleRaw);

    if (!username?.trim())
      throw new BadRequestException('Username cannot be empty');
    if (!password?.trim())
      throw new BadRequestException('Password cannot be empty');

    const passwordHash = await this.hashPassword(password);

    if (!passwordHash) return;

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
        type: ActivityType.AUTH_REGISTER,
        actorId: user.id,
        meta: { username: user.username, role: user.role },
        targetType: null,
        targetId: null,
      });

      const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
      };
      return {
        access_token: await this.generateJwt(payload),
        user,
      };
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === PRISMA_ERROR_UNIQUE_CONSTRAINT) {
          throw new ConflictException('Username already taken');
        }
      }
      throw e;
    }
  }

  verifyToken(token: string): JwtPayload {
    return this.jwt.verify(token);
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  private normalizeRole(roleRaw: string): Role {
    const r = (roleRaw || '').toLocaleUpperCase().trim();
    if (r === 'OWNER') return Role.OWNER;
    if (r === 'USER') return Role.USER;
    throw new BadRequestException('Role must be USER or OWNER');
  }
}
