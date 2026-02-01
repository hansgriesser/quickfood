import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatButtonComponent } from './chat/chat';
import { ChatButton } from './chat-button/chat-button';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ChatButtonComponent,
    ChatButton
  ]
})
export class ChatModule { }
