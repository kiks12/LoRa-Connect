/*
  Warnings:

  - You are about to drop the column `finalTime` on the `Operations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Operations` DROP COLUMN `finalTime`,
    ADD COLUMN `timeOfArrival` DATETIME(3) NULL,
    ADD COLUMN `timeOfCompletion` DATETIME(3) NULL;
