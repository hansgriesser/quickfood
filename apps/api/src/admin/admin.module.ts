import { Module } from '@nestjs/common';
import { AdminRestaurantsController } from './restaurants/admin-restaurants.controller';
import { AdminRestaurantsService } from './restaurants/admin-restaurants.service';
import { AdminUsersController } from './users/admin-users.controller';
import { AdminUsersService } from './users/admin-users.service';
import { AdminStatsController } from './stats/admin-stats.controller';
import { AdminStatsService } from './stats/admin-stats.service';

import { AdminZonesController } from './zones/admin-zones.controller';
import { AdmiZonesService } from './zones/admin-zones.service';
import { AdminActivityController } from './activity/admin-activity.controller';
import { AdminActivityService } from './activity/admin-activity.service';

@Module({
  controllers: [
    AdminRestaurantsController,
    AdminUsersController,
    AdminStatsController,
    AdminZonesController,
    AdminActivityController,
  ],
  providers: [
    AdminRestaurantsService,
    AdminUsersService,
    AdminStatsService,
    AdmiZonesService,
    AdmiZonesService,
    AdminActivityService,
  ],
})
export class AdminModule {}
