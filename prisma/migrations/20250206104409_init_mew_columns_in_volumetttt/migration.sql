/*
  Warnings:

  - You are about to drop the column `postion` on the `volumediscount` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `volumediscount` DROP COLUMN `postion`,
    ADD COLUMN `position` VARCHAR(191) NULL;
