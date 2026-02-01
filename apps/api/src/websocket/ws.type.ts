import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
  };
  handshake: Socket['handshake'] & {
    auth?: {
      token?: string;
    };
  };
}
