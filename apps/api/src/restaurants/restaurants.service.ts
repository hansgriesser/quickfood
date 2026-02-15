import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Dish, RestaurantStatus } from '../../generated/prisma/client';

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

  async getById(id: string) {
    return this.prisma.restaurant.findUnique({
      where: { id },
      select: { category: true, rating: true, name: true },
    });
  }

  async getDishesByRestaurant(id: string) {
    const categories = await this.prisma.menuCategory.findMany({
      where: {
        restaurantId: id,
      },
      include: {
        dishes: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    const mappedCategories = categories.map((cat) => ({
      ...cat,
      dishes: cat.dishes.map((dish) => this.mapDish(dish)),
    }));

    const uncategorizedDishes = await this.prisma.dish.findMany({
      where: {
        restaurantId: id,
        categoryId: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const result = [...mappedCategories];

    if (uncategorizedDishes.length > 0) {
      result.push({
        id: 0,
        name: 'Sonstiges',
        sortOrder: 999,
        restaurantId: id,
        dishes: uncategorizedDishes.map((dish) => this.mapDish(dish)),
        createdAt: new Date(0),
        updatedAt: new Date(0),
      });
    }
    return result;
  }

  mapDish(dish: Dish) {
    return {
      ...dish,
      price: Number(dish.price),
    };
  }
}
