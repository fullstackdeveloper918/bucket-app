-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `isOnline` BOOLEAN NOT NULL DEFAULT false,
    `scope` VARCHAR(191) NULL,
    `expires` DATETIME(3) NULL,
    `accessToken` VARCHAR(191) NOT NULL,
    `userId` BIGINT NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `accountOwner` BOOLEAN NOT NULL DEFAULT false,
    `locale` VARCHAR(191) NULL,
    `collaborator` BOOLEAN NULL DEFAULT false,
    `emailVerified` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id` VARCHAR(191) NOT NULL,
    `shopDomain` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `userName` VARCHAR(191) NOT NULL,
    `userEmail` VARCHAR(191) NULL,
    `rating` DOUBLE NOT NULL,
    `comment` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `productName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reviewId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bundle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `displayLocation` VARCHAR(191) NULL,
    `method` VARCHAR(191) NULL,
    `chooseAmount` DOUBLE NULL,
    `totalAmount` DOUBLE NULL,
    `domainName` VARCHAR(191) NULL,
    `products` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bundleId` INTEGER NOT NULL,
    `total` DOUBLE NOT NULL,
    `domainName` VARCHAR(191) NOT NULL,
    `bundleType` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cats` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prod_id` INTEGER NOT NULL,
    `cat_name` VARCHAR(191) NOT NULL,
    `cat_desc` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LaunchBundle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email_send_at` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `five_star` VARCHAR(191) NULL,
    `four_star` VARCHAR(191) NULL,
    `three_star` VARCHAR(191) NULL,
    `two_star` VARCHAR(191) NULL,
    `one_star` VARCHAR(191) NULL,
    `button_color` VARCHAR(191) NOT NULL,
    `button_text` VARCHAR(191) NOT NULL,
    `footer_unsubscribe_text` VARCHAR(191) NOT NULL,
    `button_unsubscribe_text` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cat_name` VARCHAR(191) NOT NULL,
    `product_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bogoxy` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bundle_name` VARCHAR(191) NULL,
    `buysx` JSON NULL,
    `gety` JSON NULL,
    `where_to_display` VARCHAR(191) NULL,
    `discount_method` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL DEFAULT 0,
    `domainName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bogoOffer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bogo_id` INTEGER NOT NULL,
    `discount_id` VARCHAR(191) NULL,
    `domainName` VARCHAR(191) NULL,
    `title_section` JSON NULL,
    `title` JSON NULL,
    `product` JSON NULL,
    `bundle_cost` JSON NULL,
    `call_to_action_button` JSON NULL,
    `text_below_cta` JSON NULL,
    `backgroud` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `volumeDiscount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bundle_name` VARCHAR(191) NULL,
    `discount_id` VARCHAR(191) NULL,
    `select_product_volume_discount` VARCHAR(191) NULL,
    `product_details` JSON NULL,
    `product_all` INTEGER NULL,
    `discount_method` VARCHAR(191) NULL,
    `tier` JSON NULL,
    `above_title_section` JSON NULL,
    `text_below_cta` JSON NULL,
    `title` JSON NULL,
    `Tiers` JSON NULL,
    `background` JSON NULL,
    `domainName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Images` ADD CONSTRAINT `Images_reviewId_fkey` FOREIGN KEY (`reviewId`) REFERENCES `Review`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sales` ADD CONSTRAINT `Sales_bundleId_fkey` FOREIGN KEY (`bundleId`) REFERENCES `Bundle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bogoOffer` ADD CONSTRAINT `bogoOffer_bogo_id_fkey` FOREIGN KEY (`bogo_id`) REFERENCES `Bogoxy`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
