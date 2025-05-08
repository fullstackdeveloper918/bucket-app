/*
  Warnings:

  - You are about to drop the `bogooffer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `bogooffer` DROP FOREIGN KEY `bogoOffer_bogo_id_fkey`;

-- AlterTable
ALTER TABLE `bogoxy` ADD COLUMN `backgroud` JSON NULL,
    ADD COLUMN `bundle_cost` JSON NULL,
    ADD COLUMN `call_to_action_button` JSON NULL,
    ADD COLUMN `discount_id` VARCHAR(191) NULL,
    ADD COLUMN `position` VARCHAR(191) NULL,
    ADD COLUMN `product` JSON NULL,
    ADD COLUMN `section` VARCHAR(191) NULL,
    ADD COLUMN `text_below_cta` JSON NULL,
    ADD COLUMN `title` JSON NULL,
    ADD COLUMN `title_section` JSON NULL;

-- DropTable
DROP TABLE `bogooffer`;
