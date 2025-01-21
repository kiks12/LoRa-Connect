-- DropForeignKey
ALTER TABLE `VictimStatusReport` DROP FOREIGN KEY `VictimStatusReport_operationsMissionId_fkey`;

-- AddForeignKey
ALTER TABLE `VictimStatusReport` ADD CONSTRAINT `VictimStatusReport_operationsMissionId_fkey` FOREIGN KEY (`operationsMissionId`) REFERENCES `Operations`(`missionId`) ON DELETE CASCADE ON UPDATE CASCADE;
