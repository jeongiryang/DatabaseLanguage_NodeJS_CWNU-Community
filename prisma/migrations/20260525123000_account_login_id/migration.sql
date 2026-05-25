ALTER TABLE "users" RENAME COLUMN "email" TO "loginId";

ALTER INDEX IF EXISTS "users_email_key" RENAME TO "users_loginId_key";
