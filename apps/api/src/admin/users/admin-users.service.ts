import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityService } from '../../activity/activity.service';
import {
  ActivityTargetType,
  ActivityType,
  ModerationActionType,
  Role,
} from '@generated/prisma/enums';

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
    return this.processModerationAction({
      userId,
      moderatorId,
      reason,
      actionType: ModerationActionType.WARN,
      activityType: ActivityType.ADMIN_USER_WARN,
    });
  }

  async suspend(
    userId: number,
    moderatorId: number,
    until?: string,
    reason?: string,
  ) {
    return this.processModerationAction({
      userId,
      moderatorId,
      reason,
      until,
      actionType: ModerationActionType.SUSPEND,
      activityType: ActivityType.ADMIN_USER_SUSPEND,
    });
  }

  async unsuspend(userId: number, moderatorId: number) {
    return this.processModerationAction({
      userId,
      moderatorId,
      actionType: ModerationActionType.UNSUSPEND,
      activityType: ActivityType.ADMIN_USER_UNSUSPEND,
    });
  }

  private async processModerationAction(params: {
    userId: number;
    moderatorId: number;
    actionType: ModerationActionType;
    activityType: ActivityType;
    reason?: string;
    until?: string;
  }) {
    const { userId, moderatorId, actionType, activityType, reason, until } =
      params;

    const targetUser = await this.getUserOrThrow(userId);
    const untilDate = until ? new Date(until) : null;

    if (actionType === ModerationActionType.SUSPEND) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { isSuspended: true, suspendedUntil: untilDate },
      });
    } else if (actionType === ModerationActionType.UNSUSPEND) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { isSuspended: false, suspendedUntil: null },
      });
    }

    const action = await this.prisma.userModerationAction.create({
      data: {
        targetUserId: userId,
        moderatorId,
        type: actionType,
        reason,
        until: actionType === ModerationActionType.SUSPEND ? untilDate : null,
      },
    });

    await this.activity.log({
      type: activityType,
      actorId: moderatorId,
      targetType: ActivityTargetType.USER,
      targetId: String(userId),
      meta: {
        reason,
        until:
          actionType === ModerationActionType.SUSPEND ? untilDate : undefined,
        moderationActionId: action.id,
        targetUsername: targetUser.username,
      },
    });

    return action;
  }

  private async getUserOrThrow(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
