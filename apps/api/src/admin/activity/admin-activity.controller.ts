import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { AdminActivityService } from './admin-activity.service';
import { ListActivityQuery } from '../../activity/dto/list-activity.dto';

@Controller('admin/activity')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminActivityController {
  constructor(private readonly service: AdminActivityService) {}

  @Get()
  list(@Query() q: ListActivityQuery) {
    return this.service.list(q);
  }
}
