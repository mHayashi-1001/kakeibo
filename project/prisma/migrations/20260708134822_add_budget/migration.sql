-- CreateTable
CREATE TABLE "budget" (
    "category" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "budget_pkey" PRIMARY KEY ("category")
);
