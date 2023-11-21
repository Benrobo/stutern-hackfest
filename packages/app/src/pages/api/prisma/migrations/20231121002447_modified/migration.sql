/*
  Warnings:

  - The values [WEBPAGES,PDF] on the enum `CharDatasource` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `description` on the `Chats` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Chats` table. All the data in the column will be lost.
  - You are about to drop the `Inbox` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ChatsToUsers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `agent_name` to the `Chats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Chats` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ConversationControl" AS ENUM ('AI', 'User');

-- AlterEnum
BEGIN;
CREATE TYPE "CharDatasource_new" AS ENUM ('webpages', 'file');
ALTER TABLE "Datasource" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Datasource" ALTER COLUMN "type" TYPE "CharDatasource_new" USING ("type"::text::"CharDatasource_new");
ALTER TYPE "CharDatasource" RENAME TO "CharDatasource_old";
ALTER TYPE "CharDatasource_new" RENAME TO "CharDatasource";
DROP TYPE "CharDatasource_old";
ALTER TABLE "Datasource" ALTER COLUMN "type" SET DEFAULT 'webpages';
COMMIT;

-- AlterTable
ALTER TABLE "Chats" DROP COLUMN "description",
DROP COLUMN "title",
ADD COLUMN     "agent_name" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Datasource" ALTER COLUMN "type" SET DEFAULT 'webpages';

-- DropTable
DROP TABLE "Inbox";

-- DropTable
DROP TABLE "_ChatsToUsers";

-- CreateTable
CREATE TABLE "DatasourceMetaData" (
    "id" TEXT NOT NULL,
    "data_source_id" TEXT NOT NULL,
    "metadata" TEXT,

    CONSTRAINT "DatasourceMetaData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversations" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "in_control" "ConversationControl" NOT NULL DEFAULT 'AI',
    "content" TEXT NOT NULL,

    CONSTRAINT "Conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DatasourceMetaData_id_key" ON "DatasourceMetaData"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DatasourceMetaData_data_source_id_key" ON "DatasourceMetaData"("data_source_id");

-- CreateIndex
CREATE INDEX "DatasourceMetaData_data_source_id_idx" ON "DatasourceMetaData"("data_source_id");

-- CreateIndex
CREATE UNIQUE INDEX "Conversations_id_key" ON "Conversations"("id");

-- CreateIndex
CREATE INDEX "Conversations_chatId_idx" ON "Conversations"("chatId");

-- CreateIndex
CREATE INDEX "Conversations_userId_idx" ON "Conversations"("userId");

-- CreateIndex
CREATE INDEX "Chats_userId_idx" ON "Chats"("userId");

-- CreateIndex
CREATE INDEX "Datasource_chatId_idx" ON "Datasource"("chatId");
