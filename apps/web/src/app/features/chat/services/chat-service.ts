import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { ChatMessage } from "../chat-message.dto";

const CHAT_WS_URL = 'ws://localhost:3000/api/order/chat';

@Injectable({ providedIn: 'root' })
export class ChatService {

  private isOpenSubject = new BehaviorSubject<boolean>(false);
  readonly isOpen$ = this.isOpenSubject.asObservable();

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  readonly messages$ = this.messagesSubject.asObservable();

  private socket?: WebSocket;

  toggleChat() {
    this.isOpenSubject.value
      ? this.closeChat()
      : this.openChat();
  }

  openChat() {
    if (this.isOpenSubject.value) return;

    this.isOpenSubject.next(true);
    this.connect();
  }

  closeChat() {
    if (!this.isOpenSubject.value) return;

    this.isOpenSubject.next(false);
    this.disconnect();
  }

  private connect() {
    if (this.socket) return;

    this.socket = new WebSocket(CHAT_WS_URL);

    this.socket.onopen = () => {
      console.log('Chat connected');
    };

    this.socket.onmessage = (event) => {
      const msg: ChatMessage = JSON.parse(event.data);
      this.messagesSubject.next([...this.messagesSubject.value, msg]);
    };

    this.socket.onclose = () => {
      console.log('Chat disconnected');
      this.socket = undefined;
    };
  }

  private disconnect() {
    this.socket?.close();
    this.socket = undefined;
  }

  sendMessage(text: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

    const msg: ChatMessage = { message: text, fromUser: true, timestamp: new Date().toISOString() };
    this.socket.send(JSON.stringify(msg));

    // Direkt auch lokal hinzufügen
    this.messagesSubject.next([...this.messagesSubject.value, msg]);
  }
}
