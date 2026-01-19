import { Module } from '@nestjs/common';
import { AdminRestaurantsController } from './restaurants/admin-restaurants.controller';
import { AdminRestaurantsService } from './restaurants/admin-restaurants.service';
import { AdminUsersController } from './users/admin-users.controller';
import { AdminUsersService } from './users/admin-users.service';
import { AdminStatsController } from './stats/admin-stats.controller';
import { AdminStatsService } from './stats/admin-stats.service';

import { AdminZonesController } from './zones/admin-zones.controller';
import { AdmiZonesService } from './zones/admin-zones.service';

@Module({
  controllers: [
    AdminRestaurantsController,
    AdminUsersController,
    AdminStatsController,
    AdminZonesController,
  ],
  providers: [
    AdminRestaurantsService,
    AdminUsersService,
    AdminStatsService,
    AdmiZonesService,
  ],
})
export class AdminModule {}
