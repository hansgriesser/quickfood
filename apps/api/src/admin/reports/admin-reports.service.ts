import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export type ReportGroupBy = 'day' | 'restaurant';

export type DailyOrdersRevenuePoint = {
  date: string;
  orders: number;
  revenueCents: number;
};

export type RestaurantOrdersRevenuePoint = {
  restaurantId: string;
  restaurantName: string;
  orders: number;
  revenueCents: number;
};

@Injectable()
export class AdminReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async ordersReport(args: {
    from?: string;
    to?: string;
    groupBy?: ReportGroupBy;
  }) {
    const { from, to, groupBy } = this.normalizeArgs(args);
    return this.buildOrdersRevenueReport({ from, to, groupBy });
  }

  async revenueReport(args: {
    from?: string;
    to?: string;
    groupBy?: ReportGroupBy;
  }) {
    const { from, to, groupBy } = this.normalizeArgs(args);
    return this.buildOrdersRevenueReport({ from, to, groupBy });
  }

  private normalizeArgs(args: {
    from?: string;
    to?: string;
    groupBy?: ReportGroupBy;
  }) {
    const groupBy: ReportGroupBy =
      args.groupBy === 'restaurant' ? 'restaurant' : 'day';

    const now = new Date();
    const defaultTo = new Date(now);
    defaultTo.setHours(23, 59, 59, 999);

    const defaultFrom = new Date(now);
    defaultFrom.setDate(defaultFrom.getDate() - 29);
    defaultFrom.setHours(0, 0, 0, 0);

    const from = args.from ? this.parseDateOnly(args.from, true) : defaultFrom;
    const to = args.to ? this.parseDateOnly(args.to, false) : defaultTo;

    if (from.getTime() > to.getTime()) {
      throw new BadRequestException('from must be <= to');
    }

    return { from, to, groupBy };
  }

  private parseDateOnly(value: string, startOfDay: boolean): Date {
    const m = /^\d{4}-\d{2}-\d{2}$/.exec(value);
    if (!m)
      throw new BadRequestException(
        'Invalid date format (expected YYYY-MM-DD)',
      );

    const [y, mo, d] = value.split('-').map((x) => Number(x));
    const dt = new Date(y, mo - 1, d);

    if (Number.isNaN(dt.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    if (startOfDay) dt.setHours(0, 0, 0, 0);
    else dt.setHours(23, 59, 59, 999);

    return dt;
  }

  private toDateKey(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return `${y}-${m}-${d}`;
  }

  private buildDailySkeleton(
    from: Date,
    to: Date,
  ): Map<string, DailyOrdersRevenuePoint> {
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new BadRequestException('Invalid date range');
    }

    const map = new Map<
      string,
      { date: string; orders: number; revenueCents: number }
    >();

    const cur = new Date(from);
    cur.setHours(0, 0, 0, 0);

    const end = new Date(to);
    end.setHours(0, 0, 0, 0);

    const maxDays = 366;
    let guard = 0;

    while (cur.getTime() <= end.getTime()) {
      const key = this.toDateKey(cur);
      map.set(key, { date: key, orders: 0, revenueCents: 0 });

      cur.setDate(cur.getDate() + 1);

      guard++;
      if (guard > maxDays) {
        throw new BadRequestException(
          `Date range too large (max ${maxDays} days)`,
        );
      }
    }

    return map;
  }

  private async buildOrdersRevenueReport(params: {
    from: Date;
    to: Date;
    groupBy: ReportGroupBy;
  }) {
    const where = {
      createdAt: { gte: params.from, lte: params.to },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      status: { notIn: ['REJECTED', 'CANCELLED'] as any },
    };

    if (params.groupBy === 'restaurant') {
      const grouped = await this.prisma.order.groupBy({
        by: ['restaurantId'],
        where,
        _count: { _all: true },
        _sum: { totalAmount: true },
      });

      const ids = grouped.map((g) => g.restaurantId);
      const restaurants = await this.prisma.restaurant.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true },
      });

      const nameById = new Map(restaurants.map((r) => [r.id, r.name] as const));

      const points: RestaurantOrdersRevenuePoint[] = grouped
        .map((g) => ({
          restaurantId: g.restaurantId,
          restaurantName: nameById.get(g.restaurantId) ?? g.restaurantId,
          orders: g._count._all,
          revenueCents: Number(g._sum.totalAmount ?? 0n),
        }))
        .sort((a, b) => b.revenueCents - a.revenueCents);

      const totals = points.reduce(
        (acc, p) => ({
          orders: acc.orders + p.orders,
          revenueCents: acc.revenueCents + p.revenueCents,
        }),
        { orders: 0, revenueCents: 0 },
      );

      return {
        range: {
          from: this.toDateKey(params.from),
          to: this.toDateKey(params.to),
        },
        groupBy: 'restaurant' as const,
        totals,
        points,
      };
    }

    const orders = await this.prisma.order.findMany({
      where,
      select: { createdAt: true, totalAmount: true },
    });

    const daily = this.buildDailySkeleton(params.from, params.to);

    for (const o of orders) {
      const key = this.toDateKey(o.createdAt);
      const p = daily.get(key);
      if (!p) continue;
      p.orders += 1;
      p.revenueCents += Number(o.totalAmount);
    }

    const points = Array.from(daily.values());
    const totals = points.reduce(
      (acc, p) => ({
        orders: acc.orders + p.orders,
        revenueCents: acc.revenueCents + p.revenueCents,
      }),
      { orders: 0, revenueCents: 0 },
    );

    return {
      range: {
        from: this.toDateKey(params.from),
        to: this.toDateKey(params.to),
      },
      groupBy: 'day' as const,
      totals,
      points,
    };
  }
}
