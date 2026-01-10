import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RestaurantStatus } from '../../generated/prisma/client';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async listActive() {
    return this.prisma.restaurant.findMany({
      where: { status: RestaurantStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        category: true,
        rating: true,
      },
    });
  }
}
