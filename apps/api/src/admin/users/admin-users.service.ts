import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityService } from '../../activity/activity.service';
import {
  ActivityTargetType,
  ActivityType,
  ModerationActionType,
} from '@generated/prisma/enums';

type Role = 'USER' | 'OWNER' | 'ADMIN';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityService,
  ) {}

  async list(role?: Role, suspended?: boolean) {
    return this.prisma.user.findMany({
      where: {
        ...(role ? { role } : {}),
        ...(suspended !== undefined ? { isSuspended: suspended } : {}),
      },
      select: {
        id: true,
        username: true,
        role: true,
        isSuspended: true,
        suspendedUntil: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  async warn(userId: number, moderatorId: number, reason?: string) {
    await this.ensureUserExists(userId);

    const action = await this.prisma.userModerationAction.create({
      data: { targetUserId: userId, moderatorId, type: 'WARN', reason },
    });

    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    await this.activity.log({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      type: ActivityType.ADMIN_USER_WARN,
      actorId: moderatorId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      targetType: ActivityTargetType.USER,
      targetId: String(userId),
      meta: {
        reason,
        moderationActionId: action.id,
        targetUsername: targetUser?.username,
      },
    });

    return this.prisma.userModerationAction.create({
      data: {
        targetUserId: userId,
        moderatorId,
        type: 'WARN',
        reason,
      },
    });
  }

  async suspend(
    userId: number,
    moderatorId: number,
    until?: string,
    reason?: string,
  ) {
    await this.ensureUserExists(userId);
    const untilDate = until ? new Date(until) : null;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: true,
        suspendedUntil: untilDate,
      },
    });

    const action = await this.prisma.userModerationAction.create({
      data: {
        targetUserId: userId,
        moderatorId,
        type: 'SUSPEND',
        reason,
        until: untilDate,
      },
    });

    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    await this.activity.log({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      type: ActivityType.ADMIN_USER_SUSPEND,
      actorId: moderatorId,
      targetType: ActivityTargetType.USER,
      targetId: String(userId),
      meta: {
        reason,
        until: untilDate,
        ModerationActionId: action.id,
        targetUsername: targetUser?.username,
      },
    });

    return this.prisma.userModerationAction.create({
      data: {
        targetUserId: userId,
        moderatorId,
        type: 'SUSPEND',
        reason,
        until: untilDate,
      },
    });
  }

  async unsuspend(userId: number, moderatorId: number) {
    await this.ensureUserExists(userId);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: false,
        suspendedUntil: null,
      },
    });

    const action = await this.prisma.userModerationAction.create({
      data: { targetUserId: userId, moderatorId, type: 'UNSUSPEND' },
    });

    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    await this.activity.log({
      type: ActivityType.ADMIN_USER_UNSUSPEND,
      actorId: moderatorId,
      targetType: ActivityTargetType.USER,
      targetId: String(userId),
      meta: {
        moderationActionId: action.id,
        targetUsername: targetUser?.username,
      },
    });

    return this.prisma.userModerationAction.create({
      data: {
        targetUserId: userId,
        moderatorId,
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
