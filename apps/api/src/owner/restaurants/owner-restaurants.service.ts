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
