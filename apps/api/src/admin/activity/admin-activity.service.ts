import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ListActivityQuery } from '../../activity/dto/list-activity.dto';

@Injectable()
export class AdminActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async list(q: ListActivityQuery) {
    const from = q.from ? new Date(q.from) : undefined;
    const to = q.to ? new Date(q.to) : undefined;
    const actorId = q.actorId ? Number(q.actorId) : undefined;
    const limit = q.limit ? Math.min(Number(q.limit), 200) : 50;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.activityLog.findMany({
      where: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        ...(q.type ? { type: q.type } : {}),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
