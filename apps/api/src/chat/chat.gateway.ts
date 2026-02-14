import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatService } from './chat.service';
import { SendChatMessageDto } from './dto/chat-message.dto';
import { AuthenticatedSocket } from '../websocket/ws.type';
import { AuthService } from 'src/auth/auth.service';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from 'src/websocket/ws-auth/ws-auth.guard';

@UseGuards(WsAuthGuard)
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/api/order/chat',
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server!: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) {}

  handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) throw new Error('No token!');

      const user = this.authService.verifyToken(token);
      if (!user) {
        client.disconnect();
        return;
      }
      const userId = parseInt(user.sub, 10);
      client.data.userId = userId;
      if (isNaN(userId)) {
        throw new Error('Invalid userId in token');
      }
    } catch (err) {
      if (err instanceof Error) {
        console.log('Socket connection rejected:', err.message);
      }
      client.disconnect();
    }
  }

  @SubscribeMessage('chat:join')
  async handleJoinOrder(
    @MessageBody() orderId: string,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    const userId = client.data.userId;
    const allowed = await this.chatService.isAllowedToJoin(userId, orderId);
    if (allowed) {
      void client.join(`order-${orderId}`);
    }
  }

  @SubscribeMessage('chat:send')
  handleSendMessage(
    @MessageBody() dto: SendChatMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const event = this.chatService.createChatMessage(dto, client.data.userId);

    this.server.to(`order-${dto.orderId}`).emit('chat:receive', event);
  }

  @SubscribeMessage('chat:join-owner-orders')
  async handleJoinOwnerOrders(@ConnectedSocket() client: AuthenticatedSocket) {
    const userId = client.data.userId;

    const orderIds = await this.chatService.getActiveOrderIdsForOwner(userId);

    for (const orderId of orderIds) {
      await client.join(`order-${orderId}`);
    }
    return orderIds;
  }
}
