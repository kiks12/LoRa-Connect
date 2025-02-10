/*
  Warnings:

  - You are about to drop the `Owners` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Bracelets` DROP FOREIGN KEY `Bracelets_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `Operations` DROP FOREIGN KEY `Operations_ownersOwnerId_fkey`;

-- DropTable
DROP TABLE `Owners`;

-- CreateTable
CREATE TABLE `Users` (
    `userId` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NOT NULL,
    `numberOfMembersInFamily` INTEGER NOT NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `address` VARCHAR(191) NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Bracelets` ADD CONSTRAINT `Bracelets_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Users`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;
