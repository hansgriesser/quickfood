-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('AUTH_LOGIN_SUCCESS', 'AUTH_REGISTER', 'ADMIN_USER_WARN', 'ADMIN_USER_SUSPEND', 'ADMIN_USER_UNSUSPEND', 'ADMIN_RESTAURANT_APPROVE', 'ADMIN_RESTAURANT_REJECT');

-- CreateEnum
CREATE TYPE "ActivityTargetType" AS ENUM ('USER', 'RESTAURANT', 'Order', 'VOUCHER', 'ZONE');

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "actorId" INTEGER,
    "targetType" "ActivityTargetType",
    "targetId" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityLog_type_createdAt_idx" ON "ActivityLog"("type", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_actorId_createdAt_idx" ON "ActivityLog"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_targetType_createdAt_idx" ON "ActivityLog"("targetType", "createdAt");

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
