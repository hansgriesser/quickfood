import { Module } from '@nestjs/common';
import { AdminRestaurantsController } from './restaurants/admin-restaurants.controller';
import { AdminRestaurantsService } from './restaurants/admin-restaurants.service';
import { AdminUsersController } from './users/admin-users.controller';
import { AdminUsersService } from './users/admin-users.service';

import { AdminStatsController } from './stats/admin-stats.controller';
import { AdminStatsService } from './stats/admin-stats.service';

@Module({
  controllers: [
    AdminRestaurantsController,
    AdminUsersController,
    AdminStatsController,
  ],
  providers: [AdminRestaurantsService, AdminUsersService, AdminStatsService],
})
export class AdminModule {}
