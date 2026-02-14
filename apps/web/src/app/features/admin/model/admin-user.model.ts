export type UserRole = 'USER' | 'OWNER' | 'ADMIN';

export type ModerationActionType = 'WARN' | 'SUSPEND' | 'UNSUSPEND';

export interface AdminUser {
  id: number;
  username: string;
  role: UserRole;
  isSuspended: boolean;
  suspendedUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserModerationAction {
  targetUserId: number;
  type: ModerationActionType;
  reason?: string;
  until?: string;
  moderatorId: number;
}
