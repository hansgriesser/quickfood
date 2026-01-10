import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RestaurantStatus } from '../../../generated/prisma/client';
import { CreateOwnerRestaurantDto } from './dto/create-owner-restaurant.dto';
import { UpdateOwnerRestaurantDto } from './dto/update-owner-restaurant.dto';

@Injectable()
export class OwnerRestaurantsService {
  constructor(private prisma: PrismaService) {}

  async list(ownerId: number) {
    return this.prisma.restaurant.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      include: { deliveryZones: { include: { zone: true } } },
    });
  }

  async create(ownerId: number, dto: CreateOwnerRestaurantDto) {
    return this.prisma.restaurant.create({
      data: {
        ownerId,
        name: dto.name,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        category: dto.category,
        status: RestaurantStatus.PENDING,
      },
    });
  }

  async update(ownerId: number, restaurantId: string, dto: UpdateOwnerRestaurantDto) {
    const existing = await this.prisma.restaurant.findFirst({
      where: { id: restaurantId, ownerId },
    });

    if (!existing) {
      throw new NotFoundException('Restaurant not found');
    }

    return this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        name: dto.name,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        category: dto.category,
      },
    });
  }
}
