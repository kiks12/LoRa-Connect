/*
  Warnings:

  - You are about to drop the column `createAt` on the `Operations` table. All the data in the column will be lost.
  - Added the required column `rescuerBraceletId` to the `Operations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userBraceletId` to the `Operations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Operations` DROP FOREIGN KEY `Operations_evacuationCentersEvacuationId_fkey`;

-- AlterTable
ALTER TABLE `Operations` DROP COLUMN `createAt`,
    ADD COLUMN `rescuerBraceletId` VARCHAR(191) NOT NULL,
    ADD COLUMN `userBraceletId` VARCHAR(191) NOT NULL,
    MODIFY `evacuationCentersEvacuationId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Operations` ADD CONSTRAINT `Operations_evacuationCentersEvacuationId_fkey` FOREIGN KEY (`evacuationCentersEvacuationId`) REFERENCES `EvacuationCenters`(`evacuationId`) ON DELETE SET NULL ON UPDATE CASCADE;
