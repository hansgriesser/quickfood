import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { VoucherService } from 'src/voucher/voucher.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, VoucherService],
})
export class OrderModule {}
