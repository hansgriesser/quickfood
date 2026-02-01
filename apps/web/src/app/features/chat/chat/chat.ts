import { Component } from '@angular/core';

interface ChatMessage {
  message: string;
  fromUser: boolean;
  timestamp: string;
}

@Component({
  selector: 'app-chat-button',
  templateUrl: './chat-button.component.html',
  styleUrls: ['./chat-button.component.scss']
})
export class ChatButtonComponent {
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
