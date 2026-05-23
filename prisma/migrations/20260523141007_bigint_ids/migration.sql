/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ADD COLUMN     "ref_id" BIGINT,
ALTER COLUMN "id" SET DATA TYPE BIGINT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "ref_systems" (
    "id" BIGINT NOT NULL,
    "ref_earned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ref_systems_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_ref_id_fkey" FOREIGN KEY ("ref_id") REFERENCES "ref_systems"("id") ON DELETE SET NULL ON UPDATE CASCADE;
