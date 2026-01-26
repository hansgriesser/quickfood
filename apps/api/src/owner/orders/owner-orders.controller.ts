import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OwnerOrdersService } from './owner-orders.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UpdateOwnerOrderStatusDto } from './update-owner-order-status.dto';

@Controller('owner/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER')
export class OwnerOrdersController {
  constructor(private readonly service: OwnerOrdersService) {}

  @Get()
  listOrders(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('restaurantId') restaurantId?: string,
  ) {
    return this.service.list(req.user.sub, { status, restaurantId });
  }

  @Patch(':id/accept')
  accept(@Req() req: any, @Param('id') id: string) {
    return this.service.accept(req.user.sub, id);
  }

  @Patch(':id/reject')
  reject(@Req() req: any, @Param('id') id: string) {
    return this.service.reject(req.user.sub, id);
  }

  @Patch(':id/status')
  updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateOwnerOrderStatusDto,
  ) {
    return this.service.updateStatus(req.user.sub, id, dto.status);
  }
}
