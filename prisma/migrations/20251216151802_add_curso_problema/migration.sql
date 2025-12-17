-- CreateTable
CREATE TABLE "curso_problemas" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "descricao" VARCHAR(512) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curso_problemas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "curso_problemas_usuarioId_idx" ON "curso_problemas"("usuarioId");

-- CreateIndex
CREATE INDEX "curso_problemas_cursoId_idx" ON "curso_problemas"("cursoId");

-- AddForeignKey
ALTER TABLE "curso_problemas" ADD CONSTRAINT "curso_problemas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
