/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ForumService {
  constructor(private readonly prisma: PrismaService) {}

  async listThreadsByRestaurant(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    return this.prisma.forumThread.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, username: true } },
        _count: { select: { post: true } },
      },
    });
  }

  async createThread(
    userId: number,
    restaurantId: string,
    dto: { title: string; content: string },
  ) {
    if (!dto.title?.trim() || !dto.content?.trim()) {
      throw new BadRequestException('title and content are required');
    }

    const resaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true },
    });
    if (!resaurant) throw new NotFoundException('Restaurant not found');

    return this.prisma.forumThread.create({
      data: {
        restaurantId,
        authorId: userId,
        title: dto.title.trim(),
        content: dto.content.trim(),
      },
      include: {
        author: { select: { id: true, username: true } },
        _count: { select: { post: true } },
      },
    });
  }

  async getThread(threadId: number) {
    const thread = await this.prisma.forumThread.findUnique({
      where: { id: threadId },
      include: {
        author: { select: { id: true, username: true } },
        restaurant: { select: { id: true, name: true, ownerId: true } },
        post: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, username: true } } },
        },
      },
    });

    if (!thread) throw new NotFoundException('Thread not found');
    return thread;
  }

  async createPost(userId: number, threadId: number, dto: { content: string }) {
    if (!dto.content?.trim())
      throw new BadRequestException('content is required');

    const thread = await this.prisma.forumThread.findUnique({
      where: { id: threadId },
      select: { id: true, isClosed: true },
    });
    if (!thread) throw new NotFoundException('Thread not found');
    if (thread.isClosed) throw new BadRequestException('Thread is closed');

    return this.prisma.forumPost.create({
      data: {
        threadId,
        authorId: userId,
        content: dto.content.trim(),
      },
      include: {
        author: { select: { id: true, username: true } },
      },
    });
  }

  private async assertOwnerModeration(ownerUserId: number, threadId: number) {
    const thread = await this.prisma.forumThread.findUnique({
      where: { id: threadId },
      include: { restaurant: { select: { ownerId: true } } },
    });
    if (!thread) throw new NotFoundException('Thread not found');

    if (thread.restaurant.ownerId !== ownerUserId) {
      throw new ForbiddenException('Not allowed to moderate this restaurant');
    }
    return thread;
  }

  async closeThread(ownerUserId: number, threadId: number) {
    await this.assertOwnerModeration(ownerUserId, threadId);

    return this.prisma.forumThread.update({
      where: { id: threadId },
      data: { isClosed: true },
    });
  }

  async deleteThread(ownerUserId: number, threadId: number) {
    await this.assertOwnerModeration(ownerUserId, threadId);

    await this.prisma.forumPost.deleteMany({ where: { threadId } });
    return this.prisma.forumThread.delete({ where: { id: threadId } });
  }

  async deletePost(ownerUserId: number, postId: number) {
    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
      include: {
        thread: { include: { restaurant: { select: { ownerId: true } } } },
      },
    });
    if (!post) throw new NotFoundException('Post not found');

    if (post.thread.restaurant.ownerId !== ownerUserId) {
      throw new ForbiddenException('Not allowed to moderate this restaurant');
    }

    return this.prisma.forumPost.delete({ where: { id: postId } });
  }
}
