import { Controller, Get, Header, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { AdminReportsService, ReportGroupBy } from './admin-reports.service';

@Controller('admin/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminReportsController {
  constructor(private readonly service: AdminReportsService) {}

  @Get('orders')
  @Header('Cache-Control', 'no-store')
  async orders(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('groupBy') groupBy?: ReportGroupBy,
  ) {
    return this.service.ordersReport({ from, to, groupBy });
  }

  @Get('revenue')
  @Header('Cache-Control', 'no-store')
  async revenue(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('groupBy') groupBy?: ReportGroupBy,
  ) {
    return this.service.revenueReport({ from, to, groupBy });
  }

  @Get('orders.csv')
  @Header('Cache-Control', 'no-store')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async ordersCsv(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('groupBy') groupBy?: ReportGroupBy,
  ) {
    return this.service.ordersReportCsv({ from, to, groupBy });
  }

  @Get('revenue.csv')
  @Header('Cache-Control', 'no-store')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async revenueCsv(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('groupBy') groupBy?: ReportGroupBy,
  ) {
    return this.service.revenueReportCsv({ from, to, groupBy });
  }
}
