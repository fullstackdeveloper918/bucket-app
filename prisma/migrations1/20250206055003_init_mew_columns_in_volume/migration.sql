-- DropForeignKey
ALTER TABLE `sales` DROP FOREIGN KEY `Sales_bundleId_fkey`;

-- AlterTable
ALTER TABLE `volumediscount` ADD COLUMN `postion` JSON NULL,
    ADD COLUMN `product_id` INTEGER NULL,
    ADD COLUMN `section` JSON NULL;
