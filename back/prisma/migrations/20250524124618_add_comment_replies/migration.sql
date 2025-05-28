-- Ajout de la colonne parentId de type UUID (Prisma utilise UUID pour les id)
ALTER TABLE "Comment" ADD COLUMN "parentId" UUID;

-- Création de l'index sur parentId pour optimiser les recherches
CREATE INDEX "Comment_parentId_idx" ON "Comment" ("parentId");

-- Ajout de la contrainte de clé étrangère sur parentId vers Comment.id
ALTER TABLE "Comment" 
ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") 
REFERENCES "Comment"("id") 
ON DELETE SET NULL;
