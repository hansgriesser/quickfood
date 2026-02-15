import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RestaurantStatus } from '../../../generated/prisma/client';
import { CreateOwnerRestaurantDto } from './dto/create-owner-restaurant.dto';
import { UpdateOwnerRestaurantDto } from './dto/update-owner-restaurant.dto';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

@Injectable()
export class OwnerRestaurantsService {
  constructor(private prisma: PrismaService) {}

  async list(ownerId: number) {
    return this.prisma.restaurant.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      include: {
        deliveryZones: { include: { zone: true } },
        openingHours: { orderBy: { dayOfWeek: 'asc' } },
      },
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
        logoUrl: this.normalizePictureUrl(dto.logoUrl),
        bannerUrl: this.normalizePictureUrl(dto.bannerUrl),
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

    const data: {
      name?: string;
      contactEmail?: string;
      contactPhone?: string;
      category?: string;
      logoUrl?: string | null;
      bannerUrl?: string | null;
    } = {
      name: dto.name,
      contactEmail: dto.contactEmail,
      contactPhone: dto.contactPhone,
      category: dto.category,
      logoUrl:
        dto.logoUrl !== undefined ? this.normalizePictureUrl(dto.logoUrl) : undefined,
      bannerUrl:
        dto.bannerUrl !== undefined ? this.normalizePictureUrl(dto.bannerUrl) : undefined,
    };

    const hasRestaurantUpdates = Object.values(data).some(
      (value) => value !== undefined,
    );

    const openingHours =
      dto.openingHours !== undefined
        ? this.normalizeOpeningHours(dto.openingHours)
        : undefined;

    const deliveryZoneIds =
      dto.deliveryZoneIds !== undefined
        ? this.normalizeDeliveryZoneIds(dto.deliveryZoneIds)
        : undefined;

    if (deliveryZoneIds !== undefined && deliveryZoneIds.length > 0) {
      const zones = await this.prisma.deliveryZone.findMany({
        where: { id: { in: deliveryZoneIds }, active: true },
        select: { id: true },
      });

      if (zones.length !== deliveryZoneIds.length) {
        throw new BadRequestException(
          'One or more delivery zones are invalid or inactive.',
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      if (hasRestaurantUpdates) {
        await tx.restaurant.update({
          where: { id: restaurantId },
          data,
        });
      }

      if (deliveryZoneIds !== undefined) {
        await tx.restaurantDeliveryZone.deleteMany({
          where: { restaurantId },
        });

        if (deliveryZoneIds.length > 0) {
          await tx.restaurantDeliveryZone.createMany({
            data: deliveryZoneIds.map((zoneId) => ({
              restaurantId,
              zoneId,
            })),
          });
        }
      }

      if (openingHours !== undefined) {
        await tx.restaurantOpeningHour.deleteMany({
          where: { restaurantId },
        });

        if (openingHours.length > 0) {
          await tx.restaurantOpeningHour.createMany({
            data: openingHours.map((hour) => ({
              restaurantId,
              dayOfWeek: hour.dayOfWeek,
              opensAt: hour.opensAt,
              closesAt: hour.closesAt,
              isClosed: hour.isClosed,
            })),
          });
        }
      }

      return tx.restaurant.findUnique({
        where: { id: restaurantId },
        include: {
          deliveryZones: { include: { zone: true } },
          openingHours: { orderBy: { dayOfWeek: 'asc' } },
        },
      });
    });
  }

  async listDeliveryZones() {
    return this.prisma.deliveryZone.findMany({
      where: { active: true },
      orderBy: [{ code: 'asc' }],
    });
  }

  async createCategory(
    ownerId: number,
    restaurantId: string,
    dto: CreateMenuCategoryDto,
  ) {
    await this.ensureOwnerRestaurant(ownerId, restaurantId);
    const name = dto.name?.trim();
    if (!name) {
      throw new BadRequestException('Category name cannot be empty');
    }

    const sortOrder = this.normalizeSortOrder(dto.sortOrder);

    try {
      return await this.prisma.menuCategory.create({
        data: {
          restaurantId,
          name,
          sortOrder,
        },
      });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new BadRequestException(
          `Category '${name}' already exists for this restaurant.`,
        );
      }
      throw e;
    }
  }

  async updateCategory(
    ownerId: number,
    restaurantId: string,
    categoryId: string,
    dto: UpdateMenuCategoryDto,
  ) {
    await this.ensureOwnerRestaurant(ownerId, restaurantId);

    const categoryIdNumber = this.toInt(categoryId, 'Category');
    const existing = await this.prisma.menuCategory.findFirst({
      where: { id: categoryIdNumber, restaurantId },
    });

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    const data: { name?: string; sortOrder?: number } = {};
    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (!name) {
        throw new BadRequestException('Category name cannot be empty');
      }
      data.name = name;
    }

    if (dto.sortOrder !== undefined) {
      data.sortOrder = this.normalizeSortOrder(dto.sortOrder);
    }

    try {
      return await this.prisma.menuCategory.update({
        where: { id: categoryIdNumber },
        data,
      });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new BadRequestException(
          `Category '${data.name ?? existing.name}' already exists for this restaurant.`,
        );
      }
      throw e;
    }
  }

  async deleteCategory(
    ownerId: number,
    restaurantId: string,
    categoryId: string,
  ) {
    await this.ensureOwnerRestaurant(ownerId, restaurantId);
    const categoryIdNumber = this.toInt(categoryId, 'Category');
    const existing = await this.prisma.menuCategory.findFirst({
      where: { id: categoryIdNumber, restaurantId },
    });

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    const [_, deleted] = await this.prisma.$transaction([
      this.prisma.dish.updateMany({
        where: { restaurantId, categoryId: categoryIdNumber },
        data: { categoryId: null },
      }),
      this.prisma.menuCategory.delete({
        where: { id: categoryIdNumber },
      }),
    ]);

    return deleted;
  }

  async createDish(ownerId: number, restaurantId: string, dto: CreateDishDto) {
    await this.ensureOwnerRestaurant(ownerId, restaurantId);

    const name = dto.name?.trim();
    const description = dto.description?.trim();
    if (!name) {
      throw new BadRequestException('Dish name cannot be empty');
    }
    if (!description) {
      throw new BadRequestException('Dish description cannot be empty');
    }

    const price = this.normalizePrice(dto.price);
    const pictureUrl = this.normalizePictureUrl(dto.pictureUrl);

    let categoryId: number | null | undefined = undefined;
    if (dto.categoryId !== undefined) {
      if (dto.categoryId === null) {
        categoryId = null;
      } else {
        categoryId = this.toInt(dto.categoryId, 'Category');
        await this.ensureCategoryForRestaurant(restaurantId, categoryId);
      }
    }

    const created = await this.prisma.dish.create({
      data: {
        name,
        description,
        price: BigInt(price),
        restaurantId,
        categoryId,
        pictureUrl,
      },
    });

    return this.mapDish(created);
  }

  async updateDish(
    ownerId: number,
    restaurantId: string,
    dishId: string,
    dto: UpdateDishDto,
  ) {
    await this.ensureOwnerRestaurant(ownerId, restaurantId);

    const dishIdNumber = this.toInt(dishId, 'Dish');
    const existing = await this.prisma.dish.findFirst({
      where: { id: dishIdNumber, restaurantId },
    });

    if (!existing) {
      throw new NotFoundException('Dish not found');
    }

    const data: {
      name?: string;
      description?: string;
      price?: bigint;
      categoryId?: number | null;
      pictureUrl?: string | null;
    } = {};

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (!name) {
        throw new BadRequestException('Dish name cannot be empty');
      }
      data.name = name;
    }

    if (dto.description !== undefined) {
      const description = dto.description.trim();
      if (!description) {
        throw new BadRequestException('Dish description cannot be empty');
      }
      data.description = description;
    }

    if (dto.price !== undefined) {
      data.price = BigInt(this.normalizePrice(dto.price));
    }

    if (dto.pictureUrl !== undefined) {
      data.pictureUrl = this.normalizePictureUrl(dto.pictureUrl);
    }

    if (dto.categoryId !== undefined) {
      if (dto.categoryId === null) {
        data.categoryId = null;
      } else {
        const categoryId = this.toInt(dto.categoryId, 'Category');
        await this.ensureCategoryForRestaurant(restaurantId, categoryId);
        data.categoryId = categoryId;
      }
    }

    const updated = await this.prisma.dish.update({
      where: { id: dishIdNumber },
      data,
    });

    return this.mapDish(updated);
  }

  async deleteDish(ownerId: number, restaurantId: string, dishId: string) {
    await this.ensureOwnerRestaurant(ownerId, restaurantId);

    const dishIdNumber = this.toInt(dishId, 'Dish');
    const existing = await this.prisma.dish.findFirst({
      where: { id: dishIdNumber, restaurantId },
    });

    if (!existing) {
      throw new NotFoundException('Dish not found');
    }

    const deleted = await this.prisma.dish.delete({
      where: { id: dishIdNumber },
    });

    return this.mapDish(deleted);
  }

  private async ensureOwnerRestaurant(ownerId: number, restaurantId: string) {
    const existing = await this.prisma.restaurant.findFirst({
      where: { id: restaurantId, ownerId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Restaurant not found');
    }
  }

  private async ensureCategoryForRestaurant(
    restaurantId: string,
    categoryId: number,
  ) {
    const existing = await this.prisma.menuCategory.findFirst({
      where: { id: categoryId, restaurantId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Category not found');
    }
  }

  private normalizePrice(value: number) {
    const price = Number(value);
    if (!Number.isFinite(price) || !Number.isInteger(price) || price <= 0) {
      throw new BadRequestException(
        'Price must be a positive integer amount (in cents).',
      );
    }
    return price;
  }

  private normalizeSortOrder(value?: number) {
    if (value === undefined) {
      return 0;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
      throw new BadRequestException('sortOrder must be an integer');
    }
    return parsed;
  }

  private normalizeDeliveryZoneIds(value: string[]) {
    if (!Array.isArray(value)) {
      throw new BadRequestException('deliveryZoneIds must be an array of ids');
    }

    const normalized = value.map((id) =>
      typeof id === 'string' ? id.trim() : String(id).trim(),
    );

    if (normalized.some((id) => !id)) {
      throw new BadRequestException('deliveryZoneIds cannot contain empty values');
    }

    const unique = Array.from(new Set(normalized));
    if (unique.length !== normalized.length) {
      throw new BadRequestException('deliveryZoneIds cannot contain duplicates');
    }

    return unique;
  }

  private normalizeOpeningHours(
    value: {
      dayOfWeek: number;
      opensAt?: string;
      closesAt?: string;
      isClosed?: boolean;
    }[],
  ) {
    if (!Array.isArray(value)) {
      throw new BadRequestException('openingHours must be an array');
    }

    const seen = new Set<number>();
    const result: {
      dayOfWeek: number;
      opensAt: string;
      closesAt: string;
      isClosed: boolean;
    }[] = [];

    for (const entry of value) {
      if (!entry || typeof entry !== 'object') {
        throw new BadRequestException('openingHours entries must be objects');
      }

      const dayOfWeek = this.toInt(
        (entry as { dayOfWeek: number }).dayOfWeek,
        'Day of week',
      );
      if (dayOfWeek < 0 || dayOfWeek > 6) {
        throw new BadRequestException(
          'dayOfWeek must be between 0 (Monday) and 6 (Sunday)',
        );
      }
      if (seen.has(dayOfWeek)) {
        throw new BadRequestException('Duplicate dayOfWeek in openingHours');
      }
      seen.add(dayOfWeek);

      const isClosed = (entry as { isClosed?: boolean }).isClosed === true;
      let opensAt = (entry as { opensAt?: string }).opensAt;
      let closesAt = (entry as { closesAt?: string }).closesAt;

      if (isClosed) {
        opensAt = '00:00';
        closesAt = '00:00';
      } else {
        if (opensAt === undefined || closesAt === undefined) {
          throw new BadRequestException(
            'opensAt and closesAt are required when a day is open',
          );
        }
        opensAt = this.normalizeTime(opensAt, 'opensAt');
        closesAt = this.normalizeTime(closesAt, 'closesAt');
      }

      result.push({
        dayOfWeek,
        opensAt,
        closesAt,
        isClosed,
      });
    }

    return result;
  }

  private normalizeTime(value: string, label: string) {
    const trimmed = typeof value === 'string' ? value.trim() : String(value).trim();
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(trimmed);
    if (!match) {
      throw new BadRequestException(`${label} must be in HH:MM format`);
    }
    return trimmed;
  }

  private normalizePictureUrl(value?: string | null) {
    if (value === undefined) {
      return undefined;
    }
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  private toInt(value: string | number, label: string) {
    const parsed = typeof value === 'number' ? value : Number(value);
    if (!Number.isInteger(parsed)) {
      throw new BadRequestException(`${label} id must be an integer`);
    }
    return parsed;
  }

  private mapDish(dish: any) {
    return {
      ...dish,
      price: Number(dish.price),
    };
  }
}
