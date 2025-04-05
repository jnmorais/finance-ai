/*
  Warnings:

  - You are about to drop the column `amout` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "amout",
ADD COLUMN     "amount" DECIMAL(10,2) NOT NULL DEFAULT 0.00;
