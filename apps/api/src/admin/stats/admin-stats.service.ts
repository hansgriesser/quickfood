import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

type DailyPoint = {
  date: string;
  orders: number;
  revenueCents: number;
  newUsers: number;
};

@Injectable()
export class AdminStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [totalOrders, revenueAgg, totalUsers] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },

        where: { status: { notIn: ['REJECTED', 'CANCELLED'] } },
      }),
      this.prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
    ]);

    const totalRevenueCents = Number(revenueAgg._sum.totalAmount ?? 0n);

    const start = this.startOfDayDaysAgo(6);
    const end = new Date();

    const [ordersLast7, newUsersLast7] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          createdAt: { gte: start, lte: end },
          status: { notIn: ['REJECTED', 'CANCELLED'] },
        },
        select: {
          createdAt: true,
          totalAmount: true,
        },
      }),
      this.prisma.user.findMany({
        where: {
          createdAt: { gte: start, lte: end },
          role: { not: 'ADMIN' },
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

    const trend = this.buildDailyTrend(start, 7);

    for (const o of ordersLast7) {
      const key = this.toDateKey(o.createdAt);
      const point = trend.get(key);
      if (!point) continue;
      point.orders += 1;
      point.revenueCents += Number(o.totalAmount);
    }

    for (const u of newUsersLast7) {
      const key = this.toDateKey(u.createdAt);
      const point = trend.get(key);
      if (!point) continue;
      point.newUsers += 1;
    }

    const trendArr = Array.from(trend.values());

    const last7Orders = trendArr.reduce((s, p) => s + p.orders, 0);
    const last7RevenueCents = trendArr.reduce((s, p) => s + p.revenueCents, 0);
    const last7NewUsers = trendArr.reduce((s, p) => s + p.newUsers, 0);

    return {
      totals: {
        totalOrders,
        totalRevenueCents,
        totalUsers,
      },
      last7Days: {
        orders: last7Orders,
        revenueCents: last7RevenueCents,
        newUsers: last7NewUsers,
      },
      trend: trendArr,
    };
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
    const map = new Map<string, DailyPoint>();
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = this.toDateKey(d);
      map.set(key, {
        date: key,
        orders: 0,
        revenueCents: 0,
        newUsers: 0,
      });
    }
    return map;
  }
}
