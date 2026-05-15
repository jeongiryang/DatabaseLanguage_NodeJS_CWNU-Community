-- CreateTable
CREATE TABLE "dislikes" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dislikes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dislikes_user_id_idx" ON "dislikes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "dislikes_post_id_user_id_key" ON "dislikes"("post_id", "user_id");

-- AddForeignKey
ALTER TABLE "dislikes" ADD CONSTRAINT "dislikes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dislikes" ADD CONSTRAINT "dislikes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
