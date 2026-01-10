import { Controller, Get } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly service: RestaurantsService) {}

  @Get()
  list() {
    return this.service.listActive();
  }
}
