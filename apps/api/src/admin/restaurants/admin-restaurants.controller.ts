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
import { AuthenticatedRequest } from '../../auth/requests/auth.requests';

type RestaurantStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
@Controller('admin/restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminRestaurantsController {
  constructor(private readonly service: AdminRestaurantsService) {}

  @Get()
  async list(@Query('status') status?: RestaurantStatus) {
    return this.service.list(status);
  }

  @Patch(':id/approve')
  async approve(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.service.approve(id, req.user.sub);
  }

  @Patch(':id/reject')
  async reject(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.service.reject(id, req.user.sub);
  }
}
