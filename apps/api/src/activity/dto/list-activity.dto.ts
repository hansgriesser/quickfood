import { ActivityType, ActivityTargetType } from '@generated/prisma/enums';

export type ListActivityQuery = {
  from: string;
  to: string;
  type: ActivityType;
  actorId?: string;
  targetType?: ActivityTargetType;
  limit?: string;
};
