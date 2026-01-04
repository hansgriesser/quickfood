import { Module } from '@nestjs/common';
import { AdminRestaurantsController } from './restaurants/admin-restaurants.controller';
import { AdminRestaurantsService } from './restaurants/admin-restaurants.service';

@Module({
  controllers: [AdminRestaurantsController],
  providers: [AdminRestaurantsService],
})
export class AdminModule {}
