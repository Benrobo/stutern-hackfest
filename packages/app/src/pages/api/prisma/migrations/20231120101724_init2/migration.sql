-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "CharDatasource" AS ENUM ('WEBPAGES', 'PDF');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chats" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Datasource" (
    "id" TEXT NOT NULL,
    "type" "CharDatasource" NOT NULL DEFAULT 'WEBPAGES',
    "chatId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector,

    CONSTRAINT "Datasource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inbox" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,

    CONSTRAINT "Inbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChatsToUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_id_key" ON "Users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Chats_id_key" ON "Chats"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Datasource_id_key" ON "Datasource"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Inbox_id_key" ON "Inbox"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_ChatsToUsers_AB_unique" ON "_ChatsToUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_ChatsToUsers_B_index" ON "_ChatsToUsers"("B");
