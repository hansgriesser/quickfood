import {
  Controller,
  Post,
  Param,
  ParseIntPipe,
  Body,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { AdminUsersService } from './admin-users.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Req } from '@nestjs/common';
import { Role } from '@generated/prisma/enums';
import { AuthenticatedRequest } from 'src/auth/requests/auth.requests';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  @Get()
  list(
    @Query('role') role?: Role,
    @Query('suspended') suspended?: 'true' | 'false',
  ) {
    const suspendedBool =
      suspended === undefined ? undefined : suspended === 'true';
    return this.service.list(role, suspendedBool);
  }

  @Post(':id/warn')
  warn(
    @Param('id', ParseIntPipe) userId: number,
    @Req() req: AuthenticatedRequest,
    @Body('reason') reason?: string,
  ) {
    return this.service.warn(userId, req.user.sub, reason);
  }

  @Post(':id/suspend')
  suspend(
    @Param('id', ParseIntPipe) userId: number,
    @Req() req: AuthenticatedRequest,
    @Body('until') until?: string,
    @Body('reason') reason?: string,
  ) {
    return this.service.suspend(userId, req.user.sub, until, reason);
  }

  @Post(':id/unsuspend')
  unsuspend(
    @Param('id', ParseIntPipe) userId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.unsuspend(userId, req.user.sub);
  }
}
