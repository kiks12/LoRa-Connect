/*
  Warnings:

  - The primary key for the `Bracelets` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `Owners` DROP FOREIGN KEY `Owners_braceletsBraceletId_fkey`;

-- DropForeignKey
ALTER TABLE `Rescuers` DROP FOREIGN KEY `Rescuers_braceletsBraceletId_fkey`;

-- AlterTable
ALTER TABLE `Bracelets` DROP PRIMARY KEY,
    MODIFY `braceletId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`braceletId`);

-- AlterTable
ALTER TABLE `Owners` MODIFY `braceletsBraceletId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Rescuers` MODIFY `braceletsBraceletId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Rescuers` ADD CONSTRAINT `Rescuers_braceletsBraceletId_fkey` FOREIGN KEY (`braceletsBraceletId`) REFERENCES `Bracelets`(`braceletId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Owners` ADD CONSTRAINT `Owners_braceletsBraceletId_fkey` FOREIGN KEY (`braceletsBraceletId`) REFERENCES `Bracelets`(`braceletId`) ON DELETE RESTRICT ON UPDATE CASCADE;
