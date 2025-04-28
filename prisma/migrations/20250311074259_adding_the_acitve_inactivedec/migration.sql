-- AlterTable
ALTER TABLE `bundle` ADD COLUMN `discount_id` VARCHAR(191) NULL,
    ADD COLUMN `discount_info` JSON NULL;
