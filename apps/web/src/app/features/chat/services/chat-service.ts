import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { ChatContext, ChatMessage } from '../chat-message.dto';
import { io, Socket } from 'socket.io-client';
import { AuthService } from '../../auth/auth.service';
import { NgZone } from '@angular/core';

const CHAT_WS_URL = 'http://localhost:3000/api/order/chat';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private authService = inject(AuthService);
  private ngZone = inject(NgZone);

  private isOpenSubject = new BehaviorSubject<boolean>(false);
  readonly isOpen$ = this.isOpenSubject.asObservable();

  private socket!: Socket;

  private pendingJoinOrderId?: string;

  private chats = new Map<string, ChatContext>();

  private activeOrderId: string | null = null;
  private activeOrderIdSubject = new BehaviorSubject<string | null>(null);
  readonly activeOrderId$ = this.activeOrderIdSubject.asObservable();

  private totalUnreadCountSubject = new BehaviorSubject<number>(0);
  readonly totalUnreadMessages$ = this.totalUnreadCountSubject.asObservable();

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  readonly messages$ = this.messagesSubject.asObservable();

  get contextRole() {
    return this.authService.getUserRole();
  }
  get contextId() {
    return this.authService.getUserId();
  }

  openChatForOwner() {
    const token = this.authService.getToken();
    if (!token) return;

    this.connect(token);

    this.socket.emit('chat:join-owner-orders', (activeOrderIds: string[]) => {
      this.ngZone.run(() => {
        activeOrderIds.forEach((id) => {
          this.getOrCreateChat(id);
        });
      });
    });
  }

  openChatForOrder(orderId: string) {
    const token = this.authService.getToken();
    const role = this.authService.getUserRole();

    if (!token || !role || role === 'ADMIN') return;

    this.getOrCreateChat(orderId);

    this.connect(token);

    this.joinOrderChat(orderId);

    this.openChat(orderId);
  }

  closeChat() {
    if (!this.isOpenSubject.value) return;
    this.isOpenSubject.next(false);
    this.activeOrderIdSubject.next(null);
    this.activeOrderId = null;
    this.messagesSubject.next([]);
  }

  openChat(orderId: string) {
    const chat = this.chats.get(orderId);
    if (!chat) return;

    this.activeOrderId = orderId;
    this.activeOrderIdSubject.next(orderId);
    this.isOpenSubject.next(true);
    chat.unreadCount = 0;
    this.messagesSubject.next([...chat.messages]);
    this.totalUnreadCountSubject.next(this.calculateTotalUnread());
  }

  getUnreadCountForOrder(orderId: string) {
    console.log('unread count:', this.chats.get(orderId)?.unreadCount);
    return this.chats.get(orderId)?.unreadCount;
  }

  private connect(token: string) {
    if (!this.socket) {
      this.socket = io(CHAT_WS_URL, {
        auth: { token },
        transports: ['websocket'],
        timeout: 5000,
      });

      this.socket.on('connect', () => {
        console.log('Connected to chat');

        if (this.pendingJoinOrderId) {
          this.socket!.emit('chat:join', this.pendingJoinOrderId);
          this.pendingJoinOrderId = undefined;
        }
      });

      this.socket.on('connect_error', (err) => {
        console.error('Chat connection error', err);
      });

      this.socket.on('chat:receive', (msg) => {
        const chat = this.getOrCreateChat(msg.orderId);
        if (!chat) return;
        chat.messages.push(msg);

        if (this.activeOrderId !== msg.orderId) {
          chat.unreadCount++;
          this.totalUnreadCountSubject.next(this.calculateTotalUnread());
        } else {
          this.ngZone.run(() => {
            this.messagesSubject.next([...chat.messages]);
          });
        }
      });
    } else {
      if (this.socket.connected) return;
      this.socket.connect();
    }
  }

  private getOrCreateChat(orderId: string) {
    const existing = this.chats.get(orderId);

    if (!existing) {
      const messages = [] as ChatMessage[];
      const context = {
        orderId: orderId,
        messages: messages,
        unreadCount: 0,
      } as ChatContext;
      this.chats.set(orderId, context);
      return context;
    } else {
      return existing;
    }
  }

  private initializeOwnerChats(orderIds: string[]) {
    orderIds.forEach((id) => {
      this.getOrCreateChat(id);
    });
  }

  private joinOrderChat(orderId: string) {
    if (!this.socket) {
      this.pendingJoinOrderId = orderId;
      return;
    }
    if (this.socket.connected) {
      this.socket.emit('chat:join', orderId);
    } else {
      this.pendingJoinOrderId = orderId;
    }
  }

  private calculateTotalUnread(): number {
    let total = 0;
    for (const chat of this.chats.values()) {
      total += chat.unreadCount;
    }
    return total;
  }

  //später noch callen, wenn order fertig
  private disconnect() {
    this.socket?.disconnect();
    this.socket = undefined!;
    this.chats.clear();
    this.activeOrderId = null;
    this.isOpenSubject.next(false);
  }

  sendMessage(message: string) {
    const orderId = this.activeOrderId;
    if (!orderId) return;
    if (!this.socket || !this.socket.connected) return;

    this.socket.emit('chat:send', { orderId, message });
  }
}
