/*
  Warnings:

  - You are about to drop the column `braceletsBraceletId` on the `Teams` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Teams` DROP FOREIGN KEY `Teams_braceletsBraceletId_fkey`;

-- AlterTable
ALTER TABLE `Teams` DROP COLUMN `braceletsBraceletId`;
