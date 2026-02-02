import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [ChatService, ChatGateway],
  imports: [AuthModule],
})
export class ChatModule {}
