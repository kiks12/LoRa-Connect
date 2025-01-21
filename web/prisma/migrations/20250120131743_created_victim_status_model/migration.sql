-- CreateTable
CREATE TABLE `VictimStatusReport` (
    `victimStatusReportId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `age` INTEGER NOT NULL,
    `operationId` INTEGER NOT NULL,
    `status` ENUM('OKAY', 'MINOR_INJURY', 'MODERATE_INJURY', 'SEVERE_INJURY', 'DECEASED') NOT NULL,
    `notes` VARCHAR(191) NOT NULL,
    `operationsMissionId` INTEGER NOT NULL,

    PRIMARY KEY (`victimStatusReportId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VictimStatusReport` ADD CONSTRAINT `VictimStatusReport_operationsMissionId_fkey` FOREIGN KEY (`operationsMissionId`) REFERENCES `Operations`(`missionId`) ON DELETE RESTRICT ON UPDATE CASCADE;
