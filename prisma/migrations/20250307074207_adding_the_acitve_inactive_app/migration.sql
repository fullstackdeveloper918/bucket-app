-- CreateTable
CREATE TABLE `AppActiveInactive` (
    `id` VARCHAR(191) NOT NULL,
    `AppType` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
