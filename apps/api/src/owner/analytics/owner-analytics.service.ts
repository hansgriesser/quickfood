import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

type DailyOrdersPoint = {
  date: string;
  orders: number;
};

type TopDishPoint = {
  dishId: number;
  name: string;
  restaurantId: string | null;
  restaurantName: string | null;
  orders: number;
};

@Injectable()
export class OwnerAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(ownerId: number) {
    const start = this.startOfDayDaysAgo(6);
    const end = new Date();

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { notIn: ['REJECTED', 'CANCELLED'] as any },
        restaurant: { ownerId },
      },
      select: { createdAt: true },
    });

    const dailyMap = this.buildDailyTrend(start, 7);

    for (const order of orders) {
      const key = this.toDateKey(order.createdAt);
      const point = dailyMap.get(key);
      if (!point) continue;
      point.orders += 1;
    }

    const dailyOrders = Array.from(dailyMap.values());
    const weeklyOrders = dailyOrders.reduce((sum, p) => sum + p.orders, 0);

    const topDishes = await this.getTopDishes(ownerId, start, end);

    return {
      range: {
        from: this.toDateKey(start),
        to: this.toDateKey(end),
      },
      weeklyOrders,
      dailyOrders,
      topDishes,
    };
  }

  private async getTopDishes(
    ownerId: number,
    from: Date,
    to: Date,
  ): Promise<TopDishPoint[]> {
    const grouped = await this.prisma.orderItem.groupBy({
      by: ['dishId'],
      where: {
        dishId: { not: null },
        order: {
          createdAt: { gte: from, lte: to },
          status: { notIn: ['REJECTED', 'CANCELLED'] as any },
          restaurant: { ownerId },
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const dishIds = grouped
      .map((g) => g.dishId)
      .filter((id): id is number => id !== null);

    if (dishIds.length === 0) {
      return [];
    }

    const dishes = await this.prisma.dish.findMany({
      where: { id: { in: dishIds } },
      select: {
        id: true,
        name: true,
        restaurant: { select: { id: true, name: true } },
      },
    });

    const dishById = new Map(dishes.map((dish) => [dish.id, dish] as const));

    return grouped.map((g) => {
      const dishId = g.dishId as number;
      const dish = dishById.get(dishId);
      return {
        dishId,
        name: dish?.name ?? 'Unknown dish',
        restaurantId: dish?.restaurant?.id ?? null,
        restaurantName: dish?.restaurant?.name ?? null,
        orders: Number(g._sum.quantity ?? 0),
      };
    });
  }

  private startOfDayDaysAgo(daysAgo: number) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - daysAgo);
    return d;
  }

  private toDateKey(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private buildDailyTrend(start: Date, days: number) {
    const map = new Map<string, DailyOrdersPoint>();
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = this.toDateKey(d);
      map.set(key, { date: key, orders: 0 });
    }
    return map;
  }
}
