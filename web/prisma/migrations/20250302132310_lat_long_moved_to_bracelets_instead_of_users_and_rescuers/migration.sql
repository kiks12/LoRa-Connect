/*
  Warnings:

  - You are about to drop the column `latitude` on the `Rescuers` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Rescuers` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Bracelets` ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `longitude` DOUBLE NULL,
    ADD COLUMN `sos` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Rescuers` DROP COLUMN `latitude`,
    DROP COLUMN `longitude`;

-- AlterTable
ALTER TABLE `Users` DROP COLUMN `latitude`,
    DROP COLUMN `longitude`;
