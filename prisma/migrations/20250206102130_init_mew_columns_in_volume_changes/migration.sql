-- DropIndex
DROP INDEX `Sales_bundleId_fkey` ON `sales`;

-- AlterTable
ALTER TABLE `volumediscount` MODIFY `postion` VARCHAR(191) NULL,
    MODIFY `section` VARCHAR(191) NULL;
