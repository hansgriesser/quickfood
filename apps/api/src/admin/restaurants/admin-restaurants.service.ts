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
    return this.processRestaurantDecision(
      restaurantId,
      adminId,
      PrismaRestaurantStatus.ACTIVE,
    );
  }

  async reject(restaurantId: string, adminId: number) {
    return this.processRestaurantDecision(
      restaurantId,
      adminId,
      PrismaRestaurantStatus.REJECTED,
    );
  }

  private async processRestaurantDecision(
    restaurantId: string,
    adminId: number,
    newStatus:
      | typeof PrismaRestaurantStatus.ACTIVE
      | typeof PrismaRestaurantStatus.REJECTED,
  ) {
    const isApprove = newStatus === PrismaRestaurantStatus.ACTIVE;

    const existing = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!existing) {
      throw new NotFoundException('Restaurant not found');
    }

    if (existing.status !== PrismaRestaurantStatus.PENDING) {
      const actionText = isApprove ? 'approved' : 'rejected';
      throw new BadRequestException(
        `Only PENDING restaurants can be ${actionText} (current=${existing.status})`,
      );
    }

    const updated = await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        status: newStatus,
        approvedAt: isApprove ? new Date() : null,
        rejectedAt: isApprove ? null : new Date(),
        decisionById: adminId,
      },
    });

    await this.activity.log({
      type: isApprove
        ? ActivityType.ADMIN_RESTAURANT_APPROVE
        : ActivityType.ADMIN_RESTAURANT_REJECT,
      actorId: adminId,
      targetType: ActivityTargetType.RESTAURANT,
      targetId: restaurantId,
      meta: { name: updated.name },
    });

    return updated;
  }
}
