import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RestaurantStatus as PrismaRestaurantStatus } from '../../../generated/prisma/client';

type RestaurantStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';

@Injectable()
export class AdminRestaurantsService {
  constructor(private prisma: PrismaService) {}

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
