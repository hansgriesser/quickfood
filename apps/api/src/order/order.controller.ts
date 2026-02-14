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
import { CreateOrderDto } from './order.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/auth/requests/auth.requests';

@Controller('order')
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  placeOrder(@Body() dto: CreateOrderDto, @Req() req: AuthenticatedRequest) {
    console.log('Received order:', dto);
    const userId = req.user.sub;
    return this.service.placeOrder(dto, userId);
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
