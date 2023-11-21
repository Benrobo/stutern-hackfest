/*
  Warnings:

  - The `type` column on the `Datasource` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Datasource" DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'webpages';
