/*
  Warnings:

  - Added the required column `distance` to the `Operations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eta` to the `Operations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Operations` ADD COLUMN `distance` DOUBLE NOT NULL,
    ADD COLUMN `eta` DOUBLE NOT NULL,
    ADD COLUMN `finalTime` DOUBLE NULL;
