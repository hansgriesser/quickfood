import { OrderStatus, Role } from '@generated/prisma/enums';
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

  private readonly validOrderFilter = {
    status: { notIn: [OrderStatus.REJECTED, OrderStatus.CANCELLED] },
  };

  private readonly notAdminUserFilter = {
    role: { not: Role.ADMIN },
  };

  async getSummary() {
    const [totals, trendData] = await Promise.all([
      this.getTotals(),
      this.get7DayTrend(),
    ]);

    return {
      totals,
      last7Days: trendData.last7Days,
      trend: trendData.trendArr,
    };
  }

  private async getTotals() {
    const [totalOrders, revenueAgg, totalUsers] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: this.validOrderFilter,
      }),
      this.prisma.user.count({ where: this.notAdminUserFilter }),
    ]);

    return {
      totalOrders,
      totalRevenueCents: Number(revenueAgg._sum.totalAmount ?? 0n),
      totalUsers,
    };
  }

  private async get7DayTrend() {
    const start = this.startOfDayDaysAgo(6);
    const end = new Date();

    const [ordersLast7, newUsersLast7] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          createdAt: { gte: start, lte: end },
          ...this.validOrderFilter,
        },
        select: { createdAt: true, totalAmount: true },
      }),
      this.prisma.user.findMany({
        where: {
          createdAt: { gte: start, lte: end },
          ...this.notAdminUserFilter,
        },
        select: { createdAt: true },
      }),
    ]);

    const trend = this.buildDailyTrend(start, 7);

    for (const o of ordersLast7) {
      const point = trend.get(this.toDateKey(o.createdAt));
      if (point) {
        point.orders += 1;
        point.revenueCents += Number(o.totalAmount);
      }
    }

    for (const u of newUsersLast7) {
      const point = trend.get(this.toDateKey(u.createdAt));
      if (point) {
        point.newUsers += 1;
      }
    }

    const trendArr = Array.from(trend.values());

    return {
      last7Days: {
        orders: trendArr.reduce((s, p) => s + p.orders, 0),
        revenueCents: trendArr.reduce((s, p) => s + p.revenueCents, 0),
        newUsers: trendArr.reduce((s, p) => s + p.newUsers, 0),
      },
      trendArr,
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
