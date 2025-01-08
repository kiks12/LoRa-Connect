/*
  Warnings:

  - You are about to drop the column `braceletsBraceletId` on the `Owners` table. All the data in the column will be lost.
  - You are about to drop the column `braceletsBraceletId` on the `Rescuers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rescuerId]` on the table `Bracelets` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ownerId]` on the table `Bracelets` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Owners` DROP FOREIGN KEY `Owners_braceletsBraceletId_fkey`;

-- DropForeignKey
ALTER TABLE `Rescuers` DROP FOREIGN KEY `Rescuers_braceletsBraceletId_fkey`;

-- AlterTable
ALTER TABLE `Bracelets` ADD COLUMN `ownerId` INTEGER NULL,
    ADD COLUMN `rescuerId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Owners` DROP COLUMN `braceletsBraceletId`;

-- AlterTable
ALTER TABLE `Rescuers` DROP COLUMN `braceletsBraceletId`;

-- CreateIndex
CREATE UNIQUE INDEX `Bracelets_rescuerId_key` ON `Bracelets`(`rescuerId`);

-- CreateIndex
CREATE UNIQUE INDEX `Bracelets_ownerId_key` ON `Bracelets`(`ownerId`);

-- AddForeignKey
ALTER TABLE `Bracelets` ADD CONSTRAINT `Bracelets_rescuerId_fkey` FOREIGN KEY (`rescuerId`) REFERENCES `Rescuers`(`rescuerId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bracelets` ADD CONSTRAINT `Bracelets_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Owners`(`ownerId`) ON DELETE SET NULL ON UPDATE CASCADE;
