import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityType, ActivityTargetType } from '@generated/prisma/enums';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async log(params: {
    type: ActivityType;
    actorId: number | null;
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    targetType: ActivityTargetType | null;
    targetId: string | null;
    meta?: unknown;
  }) {
    const { type, actorId, targetType, targetId, meta } = params;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.activityLog.create({
      data: {
        type,
        actorId: actorId ?? null,
        targetType: targetType ?? null,
        targetId: targetId ?? null,
        meta: meta === undefined ? undefined : (meta as any),
      },
    });
  }
}
