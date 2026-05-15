-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "is_anonymous" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "is_anonymous" BOOLEAN NOT NULL DEFAULT false;
