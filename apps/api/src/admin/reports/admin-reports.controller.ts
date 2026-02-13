import { Controller, Get, Header, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { AdminReportsService } from './admin-reports.service';
import { ReportGroupBy } from './dto/admin-reports.dto';

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
}
