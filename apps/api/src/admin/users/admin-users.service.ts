import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async warn(userId: number, reason?: string) {
    await this.ensureUserExists(userId);

    return this.prisma.userModerationAction.create({
      data: {
        targetUserId: userId,
        moderatorId: 1, // TEMP: später aus JWT
        type: 'WARN',
        reason,
      },
    });
  }

  async suspend(userId: number, until?: string, reason?: string) {
    await this.ensureUserExists(userId);

    const untilDate = until ? new Date(until) : null;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: true,
        suspendedUntil: untilDate,
      },
    });

    return this.prisma.userModerationAction.create({
      data: {
        targetUserId: userId,
        moderatorId: 1, // TEMP
        type: 'SUSPEND',
        reason,
        until: untilDate,
      },
    });
  }

  async unsuspend(userId: number) {
    await this.ensureUserExists(userId);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: false,
        suspendedUntil: null,
      },
    });

    return this.prisma.userModerationAction.create({
      data: {
        targetUserId: userId,
        moderatorId: 1, // TEMP
        type: 'UNSUSPEND',
      },
    });
  }

  private async ensureUserExists(userId: number) {
    const exists = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException('User not found');
    }
  }
}
