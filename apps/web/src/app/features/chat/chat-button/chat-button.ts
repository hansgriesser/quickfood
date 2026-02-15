import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat-button',
  imports: [],
  templateUrl: './chat-button.html',
  styleUrl: './chat-button.css',
})
export class ChatButton {
  isOpen = false;
  @Input() unreadCount: number | null = 0;
  @Output() openChat = new EventEmitter<string>();
  @Input() orderId!: string;

  openChatButton() {
    this.openChat.emit(this.orderId);
  }
}
