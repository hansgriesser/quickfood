export interface ChatMessage {
  message: string;
  fromUserId: number;
  timestamp: string;
}

export interface ChatContext {
  orderId: string;
  messages: ChatMessage[];
  unreadCount: number;
}
