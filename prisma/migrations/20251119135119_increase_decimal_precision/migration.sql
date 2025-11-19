-- AlterTable
ALTER TABLE "debts" ALTER COLUMN "debt_amount" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "payment_history" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(15,2);
