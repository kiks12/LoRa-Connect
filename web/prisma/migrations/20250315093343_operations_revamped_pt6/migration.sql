/*
  Warnings:

  - The primary key for the `Operations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[missionId]` on the table `Operations` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `VictimStatusReport` DROP FOREIGN KEY `VictimStatusReport_operationsMissionId_fkey`;

-- AlterTable
ALTER TABLE `Operations` DROP PRIMARY KEY,
    MODIFY `missionId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `VictimStatusReport` MODIFY `operationsMissionId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Operations_missionId_key` ON `Operations`(`missionId`);

-- AddForeignKey
ALTER TABLE `VictimStatusReport` ADD CONSTRAINT `VictimStatusReport_operationsMissionId_fkey` FOREIGN KEY (`operationsMissionId`) REFERENCES `Operations`(`missionId`) ON DELETE CASCADE ON UPDATE CASCADE;
