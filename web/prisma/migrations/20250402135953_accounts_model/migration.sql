-- CreateTable
CREATE TABLE `Accounts` (
    `accountId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `type` ENUM('ADMIN') NOT NULL DEFAULT 'ADMIN',

    UNIQUE INDEX `Accounts_accountId_key`(`accountId`),
    PRIMARY KEY (`accountId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
