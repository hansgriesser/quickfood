import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from 'src/auth/auth.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  //create (=register) wird vom authService übernommen

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('full/:id')
  getFullUser(@Param('id') id: string) {
    return this.userService.getFull(+id);
  }

  @Get('check-username')
  async checkIfUsernameExists(@Query('username') username: string) {
    if (!username) {
      return { exists: false };
    }

    const user = await this.userService.findByUsername(username);
    return { exists: !!user };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }
}
