import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../chat-message.dto';

@Component({
  selector: 'app-chat-drawer',
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ChatDrawerComponent {
  isOpen = false;
  unreadCount = 0;
  newMessage = '';
  messages: ChatMessage[] = [];

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.unreadCount = 0; // Badge zurücksetzen
    }
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const msg: ChatMessage = {
      message: this.newMessage,
      fromUser: true,
      timestamp: new Date().toISOString(),
    };
    this.messages.push(msg);
    this.newMessage = '';

    // Hier später WebSocket emit
  }

  receiveMessage(msg: string) {
    this.messages.push({
      message: msg,
      fromUser: false,
      timestamp: new Date().toISOString(),
    });

    if (!this.isOpen) {
      this.unreadCount++;
    }
  }
}
