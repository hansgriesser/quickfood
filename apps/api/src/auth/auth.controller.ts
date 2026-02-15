import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role } from '@generated/prisma/enums';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    return this.auth.login(body.username, body.password);
  }

  @Post('register')
  restister(
    @Body()
    body: {
      username: string;
      password: string;
      role: Role;
    },
  ) {
    return this.auth.register(body.username, body.password, body.role);
  }
}
