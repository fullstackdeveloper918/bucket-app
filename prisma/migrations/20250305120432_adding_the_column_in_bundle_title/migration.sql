/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Bundle` will be added. If there are existing duplicate values, this will fail.
  - Made the column `name` on table `bundle` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `bundle` MODIFY `name` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Bundle_name_key` ON `Bundle`(`name`);
