interface BaseActivityLog {
  id: string;
  createdAt: string;
  actor?: {
    id: number;
    username: string;
    role: string;
  };
  targetType: string | null;
  targetId?: string | null;
}

export interface UserModerationLog extends BaseActivityLog {
  type: 'ADMIN_USER_WARN' | 'ADMIN_USER_SUSPEND' | 'ADMIN_USER_UNSUSPEND';
  meta: UserModerationMeta;
}

export interface RestaurantModerationLog extends BaseActivityLog {
  type: 'ADMIN_RESTAURANT_APPROVE' | 'ADMIN_RESTAURANT_REJECT';
  meta: RestaurantModerationMeta;
}

export interface AuthLoginLog extends BaseActivityLog {
  type: 'AUTH_LOGIN_SUCCESS';
  meta: LoginMeta;
}

export interface DefaultLog extends BaseActivityLog {
  type: string;
  meta?: never; // kommt eigentlich eh nie vor, nur default case
}

export interface AuthRegisterLog extends BaseActivityLog {
  type: 'AUTH_REGISTER';
  meta: RegisterMeta;
}

export interface RegisterMeta {
  username: string;
  role: string;
}

export type ActivityLog =
  | UserModerationLog
  | RestaurantModerationLog
  | AuthLoginLog
  | AuthRegisterLog
  | DefaultLog;

export interface UserModerationMeta {
  reason?: string;
  until?: string;
  moderationActionId: string;
  targetUsername?: string;
}

export interface LoginMeta {
  username: string;
}

export interface RestaurantModerationMeta {
  name: string;
}
