/*
  Warnings:

  - Made the column `rating` on table `Restaurant` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "DeliveryZone" ADD COLUMN     "typicalDeliveryMax" INTEGER NOT NULL DEFAULT 40,
ADD COLUMN     "typicalDeliveryMin" INTEGER NOT NULL DEFAULT 20;

-- AlterTable
ALTER TABLE "Restaurant" ALTER COLUMN "rating" SET NOT NULL,
ALTER COLUMN "rating" SET DEFAULT 0;
