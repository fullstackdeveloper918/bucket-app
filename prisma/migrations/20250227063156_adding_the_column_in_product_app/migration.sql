/*
  Warnings:

  - You are about to drop the column `widget` on the `review` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `review` DROP COLUMN `widget`,
    ADD COLUMN `addReviewBtnText` VARCHAR(191) NULL,
    ADD COLUMN `backgroundColor` VARCHAR(191) NULL,
    ADD COLUMN `backgroundShadow` BOOLEAN NULL,
    ADD COLUMN `barsRatingColor` VARCHAR(191) NULL,
    ADD COLUMN `buttonColor` VARCHAR(191) NULL,
    ADD COLUMN `starsColor` VARCHAR(191) NULL,
    ADD COLUMN `text` VARCHAR(191) NULL,
    ADD COLUMN `textColor` VARCHAR(191) NULL,
    ADD COLUMN `textSize` INTEGER NULL,
    ADD COLUMN `verifiedPurchase` BOOLEAN NULL;
