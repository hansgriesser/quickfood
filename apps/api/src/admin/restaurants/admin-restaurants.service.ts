import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RestaurantStatus as PrismaRestaurantStatus } from '../../../generated/prisma/client';
import { ActivityService } from '../../activity/activity.service';
import { ActivityTargetType, ActivityType } from '@generated/prisma/enums';

type RestaurantStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';

@Injectable()
export class AdminRestaurantsService {
  constructor(
    private prisma: PrismaService,
    private readonly activity: ActivityService,
  ) {}

  async list(status?: RestaurantStatus) {
    return this.prisma.restaurant.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, username: true, role: true } },
      },
    });
  }

  async approve(restaurantId: string, adminId: number) {
    const existing = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!existing) throw new NotFoundException('Restaurant not found');
    if (existing.status !== PrismaRestaurantStatus.PENDING) {
      throw new BadRequestException(
        `Only PENDING restaurants can be approved (current=${existing.status})`,
      );
    }

    const updated = await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        status: PrismaRestaurantStatus.ACTIVE,
        approvedAt: new Date(),
        rejectedAt: null,
        decisionById: adminId,
      },
    });

    await this.activity.log({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      type: ActivityType.ADMIN_RESTAURANT_APPROVE,
      actorId: adminId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      targetType: ActivityTargetType.RESTAURANT,
      targetId: restaurantId,
      meta: { name: updated.name },
    });

    return this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        status: PrismaRestaurantStatus.ACTIVE,
        approvedAt: new Date(),
        rejectedAt: null,
        decisionById: adminId,
      },
    });
  }

  async reject(restaurantId: string, adminId: number) {
    const existing = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!existing) throw new NotFoundException('Restaurant not found');
    if (existing.status !== PrismaRestaurantStatus.PENDING) {
      throw new BadRequestException(
        `Only PENDING restaurants can be rejected (current=${existing.status})`,
      );
    }

    const updated = await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        status: PrismaRestaurantStatus.REJECTED,
        rejectedAt: new Date(),
        approvedAt: null,
        decisionById: adminId,
      },
    });

    await this.activity.log({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      type: ActivityType.ADMIN_RESTAURANT_REJECT,
      actorId: adminId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      targetType: ActivityTargetType.RESTAURANT,
      targetId: restaurantId,
      meta: { name: updated.name },
    });

    return this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        status: PrismaRestaurantStatus.REJECTED,
        rejectedAt: new Date(),
        approvedAt: null,
        decisionById: adminId,
      },
    });
  }
}
