/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Bracelets` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `EvacuationCenters` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Obstacle` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Rescuers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Teams` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Bracelets_name_key` ON `Bracelets`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `EvacuationCenters_name_key` ON `EvacuationCenters`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `Obstacle_name_key` ON `Obstacle`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `Rescuers_name_key` ON `Rescuers`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `Teams_name_key` ON `Teams`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `Users_userId_key` ON `Users`(`userId`);

-- CreateIndex
CREATE UNIQUE INDEX `Users_name_key` ON `Users`(`name`);
