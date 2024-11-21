/*
  Warnings:

  - You are about to drop the column `braceletId` on the `Owners` table. All the data in the column will be lost.
  - You are about to drop the column `braceletId` on the `Rescuers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Owners` DROP COLUMN `braceletId`;

-- AlterTable
ALTER TABLE `Rescuers` DROP COLUMN `braceletId`;
