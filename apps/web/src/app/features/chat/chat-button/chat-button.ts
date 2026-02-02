import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chat-button',
  imports: [CommonModule],
  templateUrl: './chat-button.html',
  styleUrl: './chat-button.css',
})
export class ChatButton {
  isOpen = false;
  @Input() unreadCount = 0;

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

}
