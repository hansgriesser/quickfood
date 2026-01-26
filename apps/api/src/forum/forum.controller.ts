import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ForumService } from './forum.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateThreadDto } from './dto/create-thread.dto';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('forum')
export class ForumController {
  constructor(private readonly service: ForumService) {}

  @Get('restaurants/:restaurantId/threads')
  listThreads(@Param('restaurantId') restaurantId: string) {
    return this.service.listThreadsByRestaurant(restaurantId);
  }

  @Get('threads/:threadId')
  getThread(@Param('threadId') threadId: string) {
    return this.service.getThread(Number(threadId));
  }

  @Post('restaurants/:restaurantId/threads')
  @UseGuards(JwtAuthGuard)
  createThread(
    @Req() req: any,
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateThreadDto,
  ) {
    return this.service.createThread(req.user.sub, restaurantId, dto);
  }

  @Post('threads/:threadId/posts')
  @UseGuards(JwtAuthGuard)
  closePost(
    @Req() req: any,
    @Param('threadId') threadId: string,
    @Body() dto: CreatePostDto,
  ) {
    return this.service.createPost(req.user.sub, Number(threadId), dto);
  }

  @Patch('threads/:threadId/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  closeThread(@Req() req: any, @Param('threadId') threadId: string) {
    return this.service.closeThread(req.user.sub, Number(threadId));
  }

  @Delete('threads/:threadId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  deletThread(@Req() req: any, @Param('threadId') threadId: string) {
    return this.service.deleteThread(req.user.sub, Number(threadId));
  }

  @Delete('posts/:postId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  deletePost(@Req() req: any, @Param('postId') postId: string) {
    return this.service.deletePost(req.user.sub, Number(postId));
  }
}
