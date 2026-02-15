import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ListActivityQuery } from '../../activity/dto/list-activity.dto';

@Injectable()
export class AdminActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async list(q: ListActivityQuery) {
    const now = new Date();

    await this.prisma.user.updateMany({
      where: {
        isSuspended: true,
        suspendedUntil: { not: null, lte: now },
      },
      data: {
        isSuspended: false,
        suspendedUntil: null,
      },
    });

    const from = q.from ? new Date(q.from) : undefined;
    const to = q.to ? new Date(q.to) : undefined;
    const actorId = q.actorId ? Number(q.actorId) : undefined;
    const limit = q.limit ? Math.min(Number(q.limit), 200) : 50;

    return this.prisma.activityLog.findMany({
      where: {
        ...(q.type ? { type: q.type } : {}),
        ...(q.targetType ? { targetType: q.targetType } : {}),
        ...(actorId !== undefined ? { actorId } : {}),
        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        actor: { select: { id: true, username: true, role: true } },
      },
    });
  }
}
