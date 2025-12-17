-- CreateTable
CREATE TABLE "usuario_cursos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "cursoSlug" TEXT NOT NULL,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "inProgress" BOOLEAN NOT NULL DEFAULT false,
    "likedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3),
    "videoProgress" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_cursos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "usuario_cursos_usuarioId_idx" ON "usuario_cursos"("usuarioId");

-- CreateIndex
CREATE INDEX "usuario_cursos_cursoSlug_idx" ON "usuario_cursos"("cursoSlug");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_cursos_usuarioId_cursoSlug_key" ON "usuario_cursos"("usuarioId", "cursoSlug");

-- AddForeignKey
ALTER TABLE "usuario_cursos" ADD CONSTRAINT "usuario_cursos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
