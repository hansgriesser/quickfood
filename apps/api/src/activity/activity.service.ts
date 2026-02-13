import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityType, ActivityTargetType } from '@generated/prisma/enums';
import { Prisma } from '@generated/prisma/client';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    type: ActivityType;
    actorId: number | null;
    targetType: ActivityTargetType | null;
    targetId: string | null;
    meta?: Prisma.InputJsonValue;
  }) {
    const { type, actorId, targetType, targetId, meta } = params;

    return this.prisma.activityLog.create({
      data: {
        type,
        actorId: actorId ?? null,
        targetType: targetType ?? null,
        targetId: targetId ?? null,
        meta: meta,
      },
    });
  }
}
