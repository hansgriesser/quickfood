import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { OwnerRestaurantsService } from './owner-restaurants.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CreateOwnerRestaurantDto } from './dto/create-owner-restaurant.dto';
import { UpdateOwnerRestaurantDto } from './dto/update-owner-restaurant.dto';

@Controller('owner/restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER')
export class OwnerRestaurantsController {
  constructor(private readonly service: OwnerRestaurantsService) {}

  @Get()
  list(@Req() req: any) {
    return this.service.list(req.user.sub);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateOwnerRestaurantDto) {
    return this.service.create(req.user.sub, dto);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateOwnerRestaurantDto,
  ) {
    return this.service.update(req.user.sub, id, dto);
  }
}
