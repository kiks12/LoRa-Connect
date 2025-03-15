/*
  Warnings:

  - You are about to drop the column `evacuationCentersEvacuationId` on the `Operations` table. All the data in the column will be lost.
  - You are about to drop the column `rescuerBraceletId` on the `Operations` table. All the data in the column will be lost.
  - You are about to drop the column `rescuersRescuerId` on the `Operations` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Operations` DROP FOREIGN KEY `Operations_evacuationCentersEvacuationId_fkey`;

-- DropForeignKey
ALTER TABLE `Operations` DROP FOREIGN KEY `Operations_rescuersRescuerId_fkey`;

-- AlterTable
ALTER TABLE `Operations` DROP COLUMN `evacuationCentersEvacuationId`,
    DROP COLUMN `rescuerBraceletId`,
    DROP COLUMN `rescuersRescuerId`,
    ADD COLUMN `teamsTeamId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Operations` ADD CONSTRAINT `Operations_teamsTeamId_fkey` FOREIGN KEY (`teamsTeamId`) REFERENCES `Teams`(`teamId`) ON DELETE SET NULL ON UPDATE CASCADE;
