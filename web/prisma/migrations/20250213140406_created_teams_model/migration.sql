-- AlterTable
ALTER TABLE `Rescuers` ADD COLUMN `teamsTeamId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Teams` (
    `teamId` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`teamId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Rescuers` ADD CONSTRAINT `Rescuers_teamsTeamId_fkey` FOREIGN KEY (`teamsTeamId`) REFERENCES `Teams`(`teamId`) ON DELETE SET NULL ON UPDATE CASCADE;
