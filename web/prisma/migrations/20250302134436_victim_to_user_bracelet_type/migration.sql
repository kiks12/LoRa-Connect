/*
  Warnings:

  - You are about to alter the column `type` on the `Bracelets` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `Bracelets` MODIFY `type` ENUM('USER', 'RESCUER') NOT NULL DEFAULT 'USER';
