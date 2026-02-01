import { Injectable } from '@nestjs/common';
import { SendChatMessageDto } from './dto/chat-message.dto';
import { ChatMessageEvent } from './events/chat-message.event';

@Injectable()
export class ChatService {
  private chats: Record<string, ChatMessageEvent[]> = {};

  createChatMessage(dto: SendChatMessageDto, userId: string): ChatMessageEvent {
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
}
