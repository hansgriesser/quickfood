import { Module } from '@nestjs/common';
import { OwnerRestaurantsController } from './restaurants/owner-restaurants.controller';
import { OwnerRestaurantsService } from './restaurants/owner-restaurants.service';

@Module({
  controllers: [OwnerRestaurantsController],
  providers: [OwnerRestaurantsService],
})
export class OwnerModule {}
