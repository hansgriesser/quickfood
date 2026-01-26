import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OwnerRestaurantsService } from './owner-restaurants.service';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateOwnerRestaurantDto } from './dto/create-owner-restaurant.dto';
import { UpdateOwnerRestaurantDto } from './dto/update-owner-restaurant.dto';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

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

  @Post(':id/categories')
  createCategory(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CreateMenuCategoryDto,
  ) {
    return this.service.createCategory(req.user.sub, id, dto);
  }

  @Patch(':id/categories/:categoryId')
  updateCategory(
    @Req() req: any,
    @Param('id') id: string,
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateMenuCategoryDto,
  ) {
    return this.service.updateCategory(req.user.sub, id, categoryId, dto);
  }

  @Delete(':id/categories/:categoryId')
  deleteCategory(
    @Req() req: any,
    @Param('id') id: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.service.deleteCategory(req.user.sub, id, categoryId);
  }

  @Post(':id/dishes')
  createDish(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CreateDishDto,
  ) {
    return this.service.createDish(req.user.sub, id, dto);
  }

  @Patch(':id/dishes/:dishId')
  updateDish(
    @Req() req: any,
    @Param('id') id: string,
    @Param('dishId') dishId: string,
    @Body() dto: UpdateDishDto,
  ) {
    return this.service.updateDish(req.user.sub, id, dishId, dto);
  }

  @Delete(':id/dishes/:dishId')
  deleteDish(
    @Req() req: any,
    @Param('id') id: string,
    @Param('dishId') dishId: string,
  ) {
    return this.service.deleteDish(req.user.sub, id, dishId);
  }
}
