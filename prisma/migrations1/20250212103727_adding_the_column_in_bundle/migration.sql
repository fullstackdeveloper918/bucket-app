-- AlterTable
ALTER TABLE `bundle` ADD COLUMN `backgroud` JSON NULL,
    ADD COLUMN `bundle_cost` JSON NULL,
    ADD COLUMN `call_to_action_button` JSON NULL,
    ADD COLUMN `position` VARCHAR(191) NULL,
    ADD COLUMN `product` JSON NULL,
    ADD COLUMN `section` VARCHAR(191) NULL,
    ADD COLUMN `text_below_cta` JSON NULL,
    ADD COLUMN `title` JSON NULL,
    ADD COLUMN `title_section` JSON NULL;
