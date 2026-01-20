import { Controller, Get, UseGuards, Header } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { AdminStatsService } from './admin-stats.service';

@Controller('admin/stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminStatsController {
  constructor(private readonly service: AdminStatsService) {}

  @Get('summary')
  @Header('Cache-Control', 'no-store')
  async summary() {
    return this.service.getSummary();
  }
}
