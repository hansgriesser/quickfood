import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { OwnerAnalyticsService } from './owner-analytics.service';

@Controller('owner/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER')
export class OwnerAnalyticsController {
  constructor(private readonly service: OwnerAnalyticsService) {}

  @Get('summary')
  getSummary(@Req() req: any) {
    return this.service.getSummary(req.user.sub);
  }
}
