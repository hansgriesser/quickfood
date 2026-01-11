import { Controller, Get, Param } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly service: RestaurantsService) {}

  @Get()
  list() {
    return this.service.listActive();
  }

  @Get(':id')
  getRestaurantById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Get(':id/dishes')
  getDishesForRestaurant(@Param('id') id: string) {
    return this.service.getDishesByRestaurant(id);
  }
}
