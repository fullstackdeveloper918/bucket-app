/*
  Warnings:

  - You are about to alter the column `backgroundShadow` on the `review` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.
  - You are about to alter the column `verifiedPurchase` on the `review` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `review` MODIFY `backgroundShadow` VARCHAR(191) NULL,
    MODIFY `verifiedPurchase` VARCHAR(191) NULL;
