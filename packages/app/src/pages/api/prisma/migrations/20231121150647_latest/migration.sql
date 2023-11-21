/*
  Warnings:

  - You are about to drop the column `content` on the `Conversations` table. All the data in the column will be lost.
  - Added the required column `anonymous_id` to the `Conversations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('ANONYMOUS', 'AI', 'ADMIN');

-- AlterTable
ALTER TABLE "Conversations" DROP COLUMN "content",
ADD COLUMN     "anonymous_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "message" TEXT NOT NULL,
    "sender_type" "SenderType" NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Messages_id_key" ON "Messages"("id");

-- CreateIndex
CREATE INDEX "Messages_conversation_id_idx" ON "Messages"("conversation_id");

-- CreateIndex
CREATE INDEX "Messages_userId_idx" ON "Messages"("userId");
