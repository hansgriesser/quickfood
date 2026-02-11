import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatService } from '../services/chat-service';

@Component({
  selector: 'app-chat-button',
  imports: [CommonModule],
  templateUrl: './chat-button.html',
  styleUrl: './chat-button.css',
})
export class ChatButton {
  isOpen = false;
  @Input() unreadCount = 0;
  @Output() openChat  = new EventEmitter<string>();
  @Input() orderId!: string;

  openChatButton(){
    this.openChat.emit(this.orderId);
  }
}
