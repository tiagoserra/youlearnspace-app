/*
  Warnings:

  - You are about to drop the column `email` on the `sugestoes` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `sugestoes` table. All the data in the column will be lost.
  - Added the required column `usuarioId` to the `sugestoes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sugestoes" DROP COLUMN "email",
DROP COLUMN "nome",
ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "sugestoes_usuarioId_idx" ON "sugestoes"("usuarioId");

-- AddForeignKey
ALTER TABLE "sugestoes" ADD CONSTRAINT "sugestoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
