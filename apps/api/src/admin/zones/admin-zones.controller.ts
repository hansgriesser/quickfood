import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { AdmiZonesService } from './admin-zones.service';
import { CreateDeliveryZoneDto } from './dto/create-delivery-zone.dto';
import { UpdateDeliveryZoneDto } from './dto/update-delivery-zone.dto';

@Controller('admin/zones')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminZonesController {
  constructor(private readonly adminZonesService: AdmiZonesService) {}

  @Get()
  list(@Query('active') active?: 'true' | 'false') {
    const activeBool = active === undefined ? undefined : active === 'true';
    return this.adminZonesService.list(activeBool);
  }

  @Post()
  create(@Body() dto: CreateDeliveryZoneDto) {
    return this.adminZonesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDeliveryZoneDto) {
    return this.adminZonesService.update(id, dto);
  }
}
