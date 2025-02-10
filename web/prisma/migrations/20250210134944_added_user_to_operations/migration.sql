/*
  Warnings:

  - You are about to drop the column `ownersOwnerId` on the `Operations` table. All the data in the column will be lost.
  - Added the required column `usersUserId` to the `Operations` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Operations_ownersOwnerId_fkey` ON `Operations`;

-- AlterTable
ALTER TABLE `Operations` DROP COLUMN `ownersOwnerId`,
    ADD COLUMN `usersUserId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `Operations_ownersOwnerId_fkey` ON `Operations`(`usersUserId`);

-- AddForeignKey
ALTER TABLE `Operations` ADD CONSTRAINT `Operations_usersUserId_fkey` FOREIGN KEY (`usersUserId`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
