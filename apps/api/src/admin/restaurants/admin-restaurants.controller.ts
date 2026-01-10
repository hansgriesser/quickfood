import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminRestaurantsService } from './admin-restaurants.service';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Req } from '@nestjs/common';

type RestaurantStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';

@Controller('admin/restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminRestaurantsController {
  constructor(private readonly service: AdminRestaurantsService) {}

  @Get()
  async list(@Query('status') status?: RestaurantStatus) {
    // status optional: PENDING | ACTIVE | REJECTED | SUSPENDED
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.service.list(status);
  }

  @Patch(':id/approve')
  async approve(@Param('id') id: string, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.approve(id, req.user.sub);
  }

  @Patch(':id/reject')
  async reject(@Param('id') id: string, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.reject(id, req.user.sub);
  }
}
