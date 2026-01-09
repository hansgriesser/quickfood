import { Module } from '@nestjs/common';
import { AdminRestaurantsController } from './restaurants/admin-restaurants.controller';
import { AdminRestaurantsService } from './restaurants/admin-restaurants.service';
import { AdminUsersController } from './users/admin-users.controller';
import { AdminUsersService } from './users/admin-users.service';

@Module({
  controllers: [AdminRestaurantsController, AdminUsersController],
  providers: [AdminRestaurantsService, AdminUsersService],
})
export class AdminModule {}
