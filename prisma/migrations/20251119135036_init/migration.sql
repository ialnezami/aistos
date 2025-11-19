-- CreateEnum
CREATE TYPE "DebtStatus" AS ENUM ('PENDING', 'PAID');

-- CreateTable
CREATE TABLE "debts" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "debt_subject" TEXT NOT NULL,
    "debt_amount" DECIMAL(10,2) NOT NULL,
    "status" "DebtStatus" NOT NULL DEFAULT 'PENDING',
    "stripe_payment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_history" (
    "id" SERIAL NOT NULL,
    "debt_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "stripe_payment_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "debts_email_key" ON "debts"("email");

-- CreateIndex
CREATE INDEX "debts_email_idx" ON "debts"("email");

-- CreateIndex
CREATE INDEX "debts_status_idx" ON "debts"("status");

-- CreateIndex
CREATE INDEX "debts_created_at_idx" ON "debts"("created_at");

-- CreateIndex
CREATE INDEX "payment_history_debt_id_idx" ON "payment_history"("debt_id");

-- CreateIndex
CREATE INDEX "payment_history_paid_at_idx" ON "payment_history"("paid_at");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- AddForeignKey
ALTER TABLE "payment_history" ADD CONSTRAINT "payment_history_debt_id_fkey" FOREIGN KEY ("debt_id") REFERENCES "debts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
