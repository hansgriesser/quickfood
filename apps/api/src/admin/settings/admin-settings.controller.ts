import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { AdminSettingService } from './admin-settings.service';
import { UpdateServiceFeeDto } from './dto/update-service-fee.dto';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminSettingsController {
  constructor(private readonly settings: AdminSettingService) {}

  @Get('service-fee')
  getServiceFee() {
    return this.settings.getServiceFee();
  }

  @Put('service-fee')
  updateServiceFee(@Body() dto: UpdateServiceFeeDto) {
    return this.settings.updateServiceFee(dto);
  }

  @Get('vouchers')
  listVouchers() {
    return this.settings.listVouchers();
  }

  @Post('vouchers')
  createVoucher(@Body() dto: CreateVoucherDto) {
    return this.settings.createVoucher(dto);
  }

  @Patch('vouchers/:id')
  updateVoucher(@Param('id') id: string, @Body() dto: UpdateVoucherDto) {
    return this.settings.updateVoucher(id, dto);
  }
}
