-- AlterTable
ALTER TABLE "Conversations" ADD COLUMN     "customer_email" TEXT;

-- CreateTable
CREATE TABLE "EscallatedConversations" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "customer_email" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EscallatedConversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EscallatedConversations_id_key" ON "EscallatedConversations"("id");

-- CreateIndex
CREATE INDEX "EscallatedConversations_chatId_idx" ON "EscallatedConversations"("chatId");
