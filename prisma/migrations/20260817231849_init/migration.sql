-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'STAFF', 'VIEWER');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('NO_TRABAJA', 'BUSCA_EMPLEO', 'TRABAJANDO', 'INDEPENDIENTE', 'ESTUDIANDO', 'ESTUDIA_Y_TRABAJA', 'OTRA', 'NO_INFORMADO');

-- CreateEnum
CREATE TYPE "NameVisibility" AS ENUM ('FULL', 'FIRST_NAME', 'INITIALS', 'CODE');

-- CreateEnum
CREATE TYPE "PhotoType" AS ENUM ('INGRESO', 'EGRESO', 'EVOLUCION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STAFF',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "canViewConfidential" BOOLEAN NOT NULL DEFAULT false,
    "canPublish" BOOLEAN NOT NULL DEFAULT false,
    "canExport" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusOption" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL DEFAULT '#6b7280',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StatusOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExitTypeOption" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ExitTypeOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "internalCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "archivedById" TEXT,
    "deletedAt" TIMESTAMP(3),
    "currentStatusCode" TEXT NOT NULL,
    "currentEmploymentStatus" "EmploymentStatus" NOT NULL DEFAULT 'NO_INFORMADO',
    "employmentStatusUpdatedAt" TIMESTAMP(3),

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonIdentity" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3),
    "sexo" TEXT,
    "rut" TEXT,
    "nacionalidad" TEXT,
    "comuna" TEXT,
    "region" TEXT,
    "telefono" TEXT,
    "correo" TEXT,
    "direccion" TEXT,
    "contactoEmergenciaNombre" TEXT,
    "contactoEmergenciaTelefono" TEXT,
    "contactoEmergenciaRelacion" TEXT,

    CONSTRAINT "PersonIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonPublicSettings" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "nameVisibility" "NameVisibility" NOT NULL DEFAULT 'CODE',
    "publicDisplayNameOverride" TEXT,

    CONSTRAINT "PersonPublicSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonConsent" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "allowPublicProfile" BOOLEAN NOT NULL DEFAULT false,
    "allowPhoto" BOOLEAN NOT NULL DEFAULT false,
    "allowName" BOOLEAN NOT NULL DEFAULT false,
    "allowAge" BOOLEAN NOT NULL DEFAULT false,
    "allowEntryYear" BOOLEAN NOT NULL DEFAULT false,
    "allowExitYear" BOOLEAN NOT NULL DEFAULT false,
    "allowReinsertionStatus" BOOLEAN NOT NULL DEFAULT false,
    "authorizedAt" TIMESTAMP(3),
    "authorizedById" TEXT,
    "documentRef" TEXT,
    "revokedAt" TIMESTAMP(3),
    "revokedById" TEXT,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonEntry" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "modalidadIngreso" TEXT,
    "motivoDerivacion" TEXT,
    "responsableId" TEXT,

    CONSTRAINT "PersonEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonExit" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "fechaEgreso" TIMESTAMP(3),
    "exitTypeCode" TEXT,
    "motivoEgreso" TEXT,
    "responsableId" TEXT,
    "observaciones" TEXT,

    CONSTRAINT "PersonExit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusHistoryEntry" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "statusCode" TEXT NOT NULL,
    "customLabel" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responsableId" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusHistoryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessStage" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "programa" TEXT,
    "etapa" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "responsableId" TEXT,
    "observaciones" TEXT,

    CONSTRAINT "ProcessStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vivienda" TEXT,
    "empleo" "EmploymentStatus",
    "estudios" TEXT,
    "redApoyo" TEXT,
    "continuidadAcompanamiento" TEXT,
    "observaciones" TEXT,
    "proximaRevision" TIMESTAMP(3),
    "registradoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "tipo" "PhotoType" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descripcion" TEXT,
    "filePath" TEXT NOT NULL,
    "publicAuthorized" BOOLEAN NOT NULL DEFAULT false,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "descripcion" TEXT,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfidentialFieldDefinition" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fieldType" TEXT NOT NULL DEFAULT 'text',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ConfidentialFieldDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfidentialEntry" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConfidentialEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalNote" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "autorId" TEXT,
    "contenido" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correctedFromId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InternalNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "personId" TEXT,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "field" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "result" TEXT NOT NULL DEFAULT 'success',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StatusOption_code_key" ON "StatusOption"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ExitTypeOption_code_key" ON "ExitTypeOption"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Person_internalCode_key" ON "Person"("internalCode");

-- CreateIndex
CREATE UNIQUE INDEX "PersonIdentity_personId_key" ON "PersonIdentity"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonPublicSettings_personId_key" ON "PersonPublicSettings"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonConsent_personId_key" ON "PersonConsent"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonEntry_personId_key" ON "PersonEntry"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonExit_personId_key" ON "PersonExit"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "ConfidentialFieldDefinition_key_key" ON "ConfidentialFieldDefinition"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ConfidentialEntry_personId_fieldKey_key" ON "ConfidentialEntry"("personId", "fieldKey");

-- AddForeignKey
ALTER TABLE "PersonIdentity" ADD CONSTRAINT "PersonIdentity_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonPublicSettings" ADD CONSTRAINT "PersonPublicSettings_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonConsent" ADD CONSTRAINT "PersonConsent_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonEntry" ADD CONSTRAINT "PersonEntry_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonExit" ADD CONSTRAINT "PersonExit_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistoryEntry" ADD CONSTRAINT "StatusHistoryEntry_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessStage" ADD CONSTRAINT "ProcessStage_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfidentialEntry" ADD CONSTRAINT "ConfidentialEntry_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;
