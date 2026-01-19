import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { OwnerModule } from './owner/owner.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AdminModule,
    AuthModule,
    OwnerModule,
    RestaurantsModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
