import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [ChatService, ChatGateway],
  imports: [AuthModule, UserModule],
})
export class ChatModule {}
