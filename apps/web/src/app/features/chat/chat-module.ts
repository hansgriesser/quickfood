import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatDrawerComponent } from './chat/chat';
import { ChatButton } from './chat-button/chat-button';

@NgModule({
  declarations: [],
  imports: [CommonModule, ChatButton, ChatDrawerComponent],
})
export class ChatModule {}
