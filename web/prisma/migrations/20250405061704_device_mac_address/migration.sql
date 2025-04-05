/*
  Warnings:

  - A unique constraint covering the columns `[braceletId]` on the table `Bracelets` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[macAddress]` on the table `Bracelets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `macAddress` to the `Bracelets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Bracelets` ADD COLUMN `macAddress` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Bracelets_braceletId_key` ON `Bracelets`(`braceletId`);

-- CreateIndex
CREATE UNIQUE INDEX `Bracelets_macAddress_key` ON `Bracelets`(`macAddress`);
