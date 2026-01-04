import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminRestaurantsService } from './admin-restaurants.service';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';

type RestaurantStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';

@Controller('admin/restaurants')
@UseGuards(RolesGuard)
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
  async approve(
    @Param('id') id: string,
    @Query('adminId', ParseIntPipe) adminId: number,
  ) {
    // Für jetzt: adminId als Query-Param (später aus JWT)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.service.approve(id, adminId);
  }

  @Patch(':id/reject')
  async reject(
    @Param('id') id: string,
    @Query('adminId', ParseIntPipe) adminId: number,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.service.reject(id, adminId);
  }
}
