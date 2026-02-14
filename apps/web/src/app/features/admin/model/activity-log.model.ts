export interface ActivityLog {
  id: string;
  type: string;
  createdAt: string;

  actor?: {
    id: number;
    username: string;
    role: string;
  };

  targetType: string | null;
  targetId?: string | null;
  meta?: any;
}
