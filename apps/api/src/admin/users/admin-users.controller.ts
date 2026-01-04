import {
  Controller,
  Post,
  Param,
  ParseIntPipe,
  Body,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { AdminUsersService } from './admin-users.service';

@Controller('admin/users')
@UseGuards(RolesGuard)
@Roles('ADMIN')
export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  @Post(':id/warn')
  warn(
    @Param('id', ParseIntPipe) userId: number,
    @Body('reason') reason?: string,
  ) {
    return this.service.warn(userId, reason);
  }

  @Post(':id/suspend')
  suspend(
    @Param('id', ParseIntPipe) userId: number,
    @Body('until') until?: string, // ISO-Date
    @Body('reason') reason?: string,
  ) {
    return this.service.suspend(userId, until, reason);
  }

  @Post(':id/unsuspend')
  unsuspend(@Param('id', ParseIntPipe) userId: number) {
    return this.service.unsuspend(userId);
  }
}
