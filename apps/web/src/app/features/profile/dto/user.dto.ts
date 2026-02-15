import { Role } from '../../auth/auth-model';

export interface User {
  username: string | null;
  id: number | null;
}

export interface FullUser {
  username: string;
  id: number;
  createdAt: string; //ISO Date string
  isSuspended: boolean;
  suspendedUntil?: string;
  role: Role;
}
