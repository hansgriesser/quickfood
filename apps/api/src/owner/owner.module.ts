import { Module } from '@nestjs/common';
import { OwnerRestaurantsController } from './restaurants/owner-restaurants.controller';
import { OwnerRestaurantsService } from './restaurants/owner-restaurants.service';
import { OwnerOrdersController } from './orders/owner-orders.controller';
import { OwnerOrdersService } from './orders/owner-orders.service';
import { OwnerAnalyticsController } from './analytics/owner-analytics.controller';
import { OwnerAnalyticsService } from './analytics/owner-analytics.service';

@Module({
  controllers: [
    OwnerRestaurantsController,
    OwnerOrdersController,
    OwnerAnalyticsController,
  ],
  providers: [
    OwnerRestaurantsService,
    OwnerOrdersService,
    OwnerAnalyticsService,
  ],
})
export class OwnerModule {}
