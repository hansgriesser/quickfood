import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

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
      // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
      role: 'USER' | 'OWNER' | string;
    },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.auth.register(body.username, body.password, body.role);
  }
}
