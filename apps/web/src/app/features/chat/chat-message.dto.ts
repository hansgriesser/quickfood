import { from } from "rxjs";

export interface ChatMessage {
    message: string;
    fromUserId: number;
    timestamp: string;
}