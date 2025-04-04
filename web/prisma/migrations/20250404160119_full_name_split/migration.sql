/*
  Warnings:

  - You are about to drop the column `name` on the `Users` table. All the data in the column will be lost.
  - Added the required column `givenName` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Users_name_key` ON `Users`;

-- AlterTable
ALTER TABLE `Users` DROP COLUMN `name`,
    ADD COLUMN `givenName` VARCHAR(191) NOT NULL,
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL,
    ADD COLUMN `middleName` VARCHAR(191) NULL,
    ADD COLUMN `suffix` VARCHAR(191) NULL;
