/*
  Warnings:

  - You are about to drop the column `name` on the `Rescuers` table. All the data in the column will be lost.
  - Added the required column `givenName` to the `Rescuers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Rescuers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `middleName` to the `Rescuers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `suffix` to the `Rescuers` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Rescuers_name_key` ON `Rescuers`;

-- AlterTable
ALTER TABLE `Rescuers` DROP COLUMN `name`,
    ADD COLUMN `givenName` VARCHAR(191) NOT NULL,
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL,
    ADD COLUMN `middleName` VARCHAR(191) NOT NULL,
    ADD COLUMN `suffix` VARCHAR(191) NOT NULL;
