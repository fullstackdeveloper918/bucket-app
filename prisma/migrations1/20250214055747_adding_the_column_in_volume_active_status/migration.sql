-- AlterTable
ALTER TABLE `bogoxy` ADD COLUMN `isActive` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `bundle` ADD COLUMN `isActive` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `volumediscount` ADD COLUMN `isActive` INTEGER NOT NULL DEFAULT 1;
