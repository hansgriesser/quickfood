import { Module } from '@nestjs/common';
import { OwnerRestaurantsController } from './restaurants/owner-restaurants.controller';
import { OwnerRestaurantsService } from './restaurants/owner-restaurants.service';
import { OwnerOrdersController } from './orders/owner-orders.controller';
import { OwnerOrdersService } from './orders/owner-orders.service';

@Module({
  controllers: [OwnerRestaurantsController, OwnerOrdersController],
  providers: [OwnerRestaurantsService, OwnerOrdersService],
})
export class OwnerModule {}
