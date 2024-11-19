-- CreateTable
CREATE TABLE `Bracelets` (
    `braceletId` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`braceletId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rescuers` (
    `rescuerId` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NOT NULL,
    `braceletsBraceletId` INTEGER NOT NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,

    PRIMARY KEY (`rescuerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Owners` (
    `ownerId` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NOT NULL,
    `numberOfMembersInFamily` INTEGER NOT NULL,
    `braceletsBraceletId` INTEGER NOT NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,

    PRIMARY KEY (`ownerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EvacuationCenters` (
    `evacuationId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `capacity` INTEGER NOT NULL,

    PRIMARY KEY (`evacuationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Operations` (
    `missionId` INTEGER NOT NULL AUTO_INCREMENT,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `rescuersRescuerId` INTEGER NOT NULL,
    `ownersOwnerId` INTEGER NOT NULL,
    `status` ENUM('ASSIGNED', 'PENDING', 'COMPLETE', 'CANCELED', 'FAILED') NOT NULL,
    `urgency` ENUM('LOW', 'MODERATE', 'SEVERE') NOT NULL,
    `numberOfRescuee` INTEGER NOT NULL,
    `evacuationCentersEvacuationId` INTEGER NOT NULL,

    PRIMARY KEY (`missionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Rescuers` ADD CONSTRAINT `Rescuers_braceletsBraceletId_fkey` FOREIGN KEY (`braceletsBraceletId`) REFERENCES `Bracelets`(`braceletId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Owners` ADD CONSTRAINT `Owners_braceletsBraceletId_fkey` FOREIGN KEY (`braceletsBraceletId`) REFERENCES `Bracelets`(`braceletId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Operations` ADD CONSTRAINT `Operations_rescuersRescuerId_fkey` FOREIGN KEY (`rescuersRescuerId`) REFERENCES `Rescuers`(`rescuerId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Operations` ADD CONSTRAINT `Operations_ownersOwnerId_fkey` FOREIGN KEY (`ownersOwnerId`) REFERENCES `Owners`(`ownerId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Operations` ADD CONSTRAINT `Operations_evacuationCentersEvacuationId_fkey` FOREIGN KEY (`evacuationCentersEvacuationId`) REFERENCES `EvacuationCenters`(`evacuationId`) ON DELETE RESTRICT ON UPDATE CASCADE;
