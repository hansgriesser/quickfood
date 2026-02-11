import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  data: {
    userId: number;
  };
  handshake: Socket['handshake'] & {
    auth?: {
      token?: string;
    };
  };
}
