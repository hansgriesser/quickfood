import { IsNotEmpty, IsString } from 'class-validator';

export class SendChatMessageDto {
  @IsString()
  @IsNotEmpty()
  orderId!: string;
  @IsString()
  @IsNotEmpty()
  message!: string;
}
