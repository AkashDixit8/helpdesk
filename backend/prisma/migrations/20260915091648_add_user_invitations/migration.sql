/*
  Warnings:

  - A unique constraint covering the columns `[invitation_token_hash]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `invitation_expires_at` DATETIME(3) NULL,
    ADD COLUMN `invitation_token_hash` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_invitation_token_hash_key` ON `users`(`invitation_token_hash`);
