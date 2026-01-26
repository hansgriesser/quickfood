/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderDto } from './order.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('order')
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  placeOrder(@Body() order: OrderDto, @Req() req) {
    console.log('Received order:', order);
    const userId = req.user.sub;
    return this.service.placeOrder(order, userId);
  }

  @Get('service-fee')
  getServiceFee() {
    return this.service.getServiceFee();
  }

  @Get(':id')
  updateOrder(@Param('id') id: string) {
    return this.service.updateOrder(id);
  }

  @Get('restaurant/:id')
  listOrders(@Param('id') id: string) {
    return this.service.listOrders(id);
  }
}
