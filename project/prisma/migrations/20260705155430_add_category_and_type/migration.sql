-- AlterTable
ALTER TABLE "item" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'その他',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT '支出';
