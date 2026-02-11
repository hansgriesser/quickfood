import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { ChatMessage } from "../chat-message.dto";
import { io, Socket } from "socket.io-client";
import { AuthService } from "../../auth/auth.service";
import { NgZone } from "@angular/core";

const CHAT_WS_URL = 'http://localhost:3000/api/order/chat'; //dafür angular unbedingt über proxy.conf.json konfigurieren
//ng serve --proxy-config src/proxy.conf.json

@Injectable({ providedIn: 'root' })
export class ChatService {

  private isOpenSubject = new BehaviorSubject<boolean>(false);
  readonly isOpen$ = this.isOpenSubject.asObservable();

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  readonly messages$ = this.messagesSubject.asObservable();

  private contextSubject = new BehaviorSubject<{ orderId: string; userId: number, role: 'USER' | 'OWNER' } | null>(null);
  readonly context$ = this.contextSubject.asObservable();

  private socket!: Socket;

  private unreadCountSubject = new BehaviorSubject<number>(0);
  readonly unreadCount$ = this.unreadCountSubject.asObservable();

  private pendingJoinOrderId?: string;

  constructor(private authService: AuthService, private ngZone: NgZone) {}

  
  openChatForOrder(orderId: string) {
    const current = this.contextSubject.value;
    const token = this.authService.getToken();
    const role = this.authService.getUserRole();

    const userId = this.authService.getUserId();
    if (!token || !userId || !role || role === 'ADMIN') return;

    if (current?.orderId !== orderId) {
      this.disconnect();
      this.contextSubject.next({ orderId, userId, role });
      console.log('Opening chat for order', orderId, 'as', userId);
    }

    this.isOpenSubject.next(true);
    this.connect(token);
    this.joinOrderChat(orderId);
  }

  closeChat() {
    if (!this.isOpenSubject.value) return;

    this.isOpenSubject.next(false);
    this.contextSubject.next(null);
    this.disconnect();
  }

  private connect(token: string) {
    if (!this.socket) {
      this.socket = io(CHAT_WS_URL, {
        auth: { token },
        transports: ['websocket'],
        timeout: 5000
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
        this.receiveMessage(msg);
      });

    } else {
      if (this.socket.connected) return;
      this.socket.connect();
    }
  }


  private joinOrderChat(orderId: string) {
    if (!this.socket){
      this.pendingJoinOrderId = orderId;
      return;      
    } 
    if (this.socket.connected) {
      this.socket.emit('chat:join', orderId);
    } else {
       this.pendingJoinOrderId = orderId;
    }
  }

  private receiveMessage(msg: ChatMessage) {
    this.ngZone.run(() => {
      const updated = [...this.messagesSubject.value, msg];
      this.messagesSubject.next(updated);
      if (!this.isOpenSubject.value) {
        this.incrementUnread();
      }
    });
  }

  
  private disconnect() {
    this.socket?.disconnect();
    this.socket = undefined!;
    this.messagesSubject.next([]);
  }

  
  sendMessage(message: string) {
    const orderId = this.contextSubject.value?.orderId;
    if (!orderId) return;
    if (!this.socket || !this.socket.connected) return;

    this.socket.emit('chat:send', { orderId, message });
  }

  resetUnreadCount() {
    this.unreadCountSubject.next(0);
  }

  incrementUnread() {
    this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
  }
}
