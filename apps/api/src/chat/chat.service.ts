import { Injectable } from '@nestjs/common';
import { SendChatMessageDto } from './dto/chat-message.dto';
import { ChatMessageEvent } from './events/chat-message.event';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@generated/prisma/enums';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ChatService {
  private chats: Record<string, ChatMessageEvent[]> = {};

  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  createChatMessage(dto: SendChatMessageDto, userId: number): ChatMessageEvent {
    const message: ChatMessageEvent = {
      orderId: dto.orderId,
      fromUserId: userId,
      message: dto.message,
      timestamp: new Date().toISOString(),
    };

    this.addMessage(message.orderId, message);

    return message;
  }

  addMessage(orderId: string, message: ChatMessageEvent) {
    if (!this.chats[orderId]) this.chats[orderId] = [];
    this.chats[orderId].push(message);
  }

  getMessages(orderId: string) {
    return this.chats[orderId] || [];
  }

  clear(orderId: string) {
    delete this.chats[orderId];
  }

  async isAllowedToJoin(userId: number, orderId: string): Promise<boolean> {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) return false;

      if (user.role === Role.OWNER) {
        return this.checkOwnerCanAccessOrder(userId, orderId);
      } else if (user.role === Role.USER) {
        return this.checkUserCanAccessOrder(userId, orderId);
      }
    } catch (err) {
      console.error('Error checking chat access:', err);
    }
    return false;
  }

  private async checkOwnerCanAccessOrder(
    userId: number,
    orderId: string,
  ): Promise<boolean> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        restaurant: {
          ownerId: userId,
        },
      },
    });

    return !!order;
  }

  private async checkUserCanAccessOrder(
    userId: number,
    orderId: string,
  ): Promise<boolean> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        customerId: userId,
      },
    });

    return !!order;
  }
}
