import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../chat-message.dto';
import { ChatService } from '../services/chat-service';
import { Observable, Subscription } from 'rxjs';
import { UserRole } from '../../admin/services/admin-users.service';

@Component({
  selector: 'app-chat-drawer',
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ChatDrawerComponent implements OnInit, OnDestroy {
  unreadCount = 0;
  newMessage = '';
  messages: ChatMessage[] = [];
  isOpen = false;
  role: UserRole | null;
  userId: number | null;
  orderId: string | null = null;

  isOwnMessage = (msg: ChatMessage) => msg.fromUserId === this.userId;

  private subscription = new Subscription();

  constructor(private chatService: ChatService) {
    this.role = this.chatService.contextRole;
    this.userId = this.chatService.contextId;
  }

  ngOnInit() {
    // Drawer öffnen / schließen beobachten
    this.subscription.add(
      this.chatService.isOpen$.subscribe((open) => {
        this.isOpen = open;
      }),
    );

    // Messages aus dem Service
    this.subscription.add(
      this.chatService.messages$.subscribe((msgs) => {
        this.messages = msgs;
        console.log('Received messages', msgs);
        // Scroll automatisch zum Ende, falls Drawer offen
        if (this.isOpen) {
          setTimeout(() => this.scrollToBottom(), 50);
        }
      }),
    );

    this.subscription.add(
      this.chatService.activeOrderId$.subscribe((id) => {
        this.orderId = id;
      }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  toggleChat() {
    if (this.isOpen) {
      this.chatService.closeChat();
    }
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;
    this.chatService.sendMessage(this.newMessage);
    this.newMessage = '';
  }

  private scrollToBottom() {
    const container = document.querySelector('.chat-messages');
    if (container) container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }
}
