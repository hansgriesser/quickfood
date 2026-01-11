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

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  @Get()
  list(
    @Query('role') role?: 'USER' | 'OWNER' | 'ADMIN',
    @Query('suspemded') suspended?: 'true' | 'false',
  ) {
    const suspemdedBool =
      suspended === undefined ? undefined : suspended === 'true';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return this.service.list(role, suspemdedBool);
  }

  @Post(':id/warn')
  warn(
    @Param('id', ParseIntPipe) userId: number,
    @Req() req: any,
    @Body('reason') reason?: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.warn(userId, req.user.sub, reason);
  }

  @Post(':id/suspend')
  suspend(
    @Param('id', ParseIntPipe) userId: number,
    @Req() req: any,
    @Body('until') until?: string,
    @Body('reason') reason?: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.suspend(userId, req.user.sub, until, reason);
  }

  @Post(':id/unsuspend')
  unsuspend(@Param('id', ParseIntPipe) userId: number, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.unsuspend(userId, req.user.sub);
  }
}
