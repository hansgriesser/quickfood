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

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/order/chat',
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server!: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) {}

  handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token = client.handshake.auth?.token;
      if (!token) throw new Error('No token!');

      const user = this.authService.verifyToken(token);
      if (!user) {
        client.disconnect();
        return;
      }
      client.data.userId = user.sub;
    } catch (err) {
      if (err instanceof Error) {
        console.log('Socket connection rejected:', err.message);
      }
      client.disconnect();
    }
  }

  handleDisconnect() {
    //cleanup, optional
  }

  @SubscribeMessage('chat:join')
  handleJoinOrder(
    @MessageBody() orderId: string,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): void {
    void client.join(`order-${orderId}`);
  }

  @SubscribeMessage('chat:send')
  handleSendMessage(
    @MessageBody() dto: SendChatMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const event = this.chatService.createChatMessage(dto, client.data.userId);

    this.server.to(`order-${dto.orderId}`).emit('chat:receive', event);
  }
}
