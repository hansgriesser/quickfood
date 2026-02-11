import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../chat-message.dto';
import { ChatService } from '../services/chat-service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-drawer',
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ChatDrawerComponent {
  unreadCount = 0;
  newMessage = '';
  messages: ChatMessage[]= [];
  isOpen: boolean = false;
  context: { orderId: string; userId: number, role: 'USER' | 'OWNER' } | null = null;
  isOwnMessage = (msg: ChatMessage) => msg.fromUserId === this.context?.userId;

  private subscription = new Subscription();

  constructor(private chatService: ChatService) {}


  ngOnInit() {
    // Drawer öffnen / schließen beobachten
    this.subscription.add(
      this.chatService.isOpen$.subscribe(open => {
        this.isOpen = open;
        if (open) {
          this.chatService.resetUnreadCount();
        }
      })
    );

    // Messages aus dem Service
    this.subscription.add(
      this.chatService.messages$.subscribe(msgs => {
        this.messages = msgs;
        console.log('Received messages', msgs);
        // Scroll automatisch zum Ende, falls Drawer offen
        if (this.isOpen) {
          setTimeout(() => this.scrollToBottom(), 50);
        } else {
          this.unreadCount += 1; // Neue Nachricht ungelesen
        }
      })
    );

    this.subscription.add(
      this.chatService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      })
    );

    this.subscription.add(
      this.chatService.context$.subscribe(ctx => {
        this.context = ctx;
      })
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
