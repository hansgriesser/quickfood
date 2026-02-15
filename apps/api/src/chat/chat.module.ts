import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { WsAuthGuard } from 'src/websocket/ws-auth/ws-auth.guard';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [ChatService, ChatGateway, WsAuthGuard, JwtService],
  imports: [AuthModule, UserModule],
})
export class ChatModule {}
