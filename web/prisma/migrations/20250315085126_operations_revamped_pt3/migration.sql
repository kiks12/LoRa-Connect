/*
  Warnings:

  - Added the required column `teamBraceletId` to the `Operations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Operations` ADD COLUMN `teamBraceletId` VARCHAR(191) NOT NULL;
