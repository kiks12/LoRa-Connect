-- AlterTable
ALTER TABLE `Teams` ADD COLUMN `braceletsBraceletId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Teams` ADD CONSTRAINT `Teams_braceletsBraceletId_fkey` FOREIGN KEY (`braceletsBraceletId`) REFERENCES `Bracelets`(`braceletId`) ON DELETE SET NULL ON UPDATE CASCADE;
