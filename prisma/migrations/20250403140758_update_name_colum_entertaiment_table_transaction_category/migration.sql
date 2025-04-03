/*
  Warnings:

  - The values [ENTERTAINMENT] on the enum `TransactionCategory` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `userId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionCategory_new" AS ENUM ('HOUSING', 'TRANSPORTATION', 'FOOD', 'ENTERTAIMENT', 'HEALTH', 'UTILITY', 'SALARY', 'EDUCATION', 'OTHER');
ALTER TABLE "Transaction" ALTER COLUMN "category" TYPE "TransactionCategory_new" USING ("category"::text::"TransactionCategory_new");
ALTER TYPE "TransactionCategory" RENAME TO "TransactionCategory_old";
ALTER TYPE "TransactionCategory_new" RENAME TO "TransactionCategory";
DROP TYPE "TransactionCategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "userId" TEXT NOT NULL;
