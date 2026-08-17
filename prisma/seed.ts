import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_STATUS_OPTIONS, DEFAULT_EXIT_TYPES } from "../lib/domain";

const prisma = new PrismaClient();

async function main() {
  // ---- catalogos ----
  for (const s of DEFAULT_STATUS_OPTIONS) {
    await prisma.statusOption.upsert({ where: { code: s.code }, update: {}, create: s });
  }
  for (const t of DEFAULT_EXIT_TYPES) {
    await prisma.exitTypeOption.upsert({ where: { code: t.code }, update: {}, create: t });
  }

  // ---- usuarios demo ----
  const pass = await bcrypt.hash("cambiar123", 10);

  await prisma.user.upsert({
    where: { email: "super@reddecompasion.org" },
    update: {},
    create: {
      name: "Super Administrador",
      email: "super@reddecompasion.org",
      passwordHash: pass,
      role: "SUPER_ADMIN",
      canViewConfidential: true,
      canPublish: true,
      canExport: true,
      canDelete: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@reddecompasion.org" },
    update: {},
    create: {
      name: "Administradora del Centro",
      email: "admin@reddecompasion.org",
      passwordHash: pass,
      role: "ADMIN",
      canViewConfidential: false,
      canPublish: true,
      canExport: true,
      canDelete: false,
    },
  });

  await prisma.user.upsert({
    where: { email: "equipo@reddecompasion.org" },
    update: {},
    create: {
      name: "Equipo Terapéutico",
      email: "equipo@reddecompasion.org",
      passwordHash: pass,
      role: "STAFF",
      canViewConfidential: true,
      canPublish: false,
      canExport: false,
      canDelete: false,
    },
  });

  await prisma.user.upsert({
    where: { email: "visor@reddecompasion.org" },
    update: {},
    create: {
      name: "Visualizador",
      email: "visor@reddecompasion.org",
      passwordHash: pass,
      role: "VIEWER",
    },
  });

  // ---- personas demo ----
  const demoPeople = [
    {
      code: "P-0001",
      nombres: "Carlos",
      apellidos: "Fuentes Rojas",
      nacimiento: new Date("1990-04-12"),
      ingreso: new Date("2023-02-10"),
      egreso: new Date("2024-05-20"),
      status: "REINSERTADO_TRABAJANDO",
      exitType: "REINSERCION_LABORAL",
      employment: "TRABAJANDO",
      consentPublic: true,
      nameVisibility: "FIRST_NAME",
    },
    {
      code: "P-0002",
      nombres: "Marcela",
      apellidos: "Soto Díaz",
      nacimiento: new Date("1988-09-03"),
      ingreso: new Date("2024-01-15"),
      egreso: null,
      status: "RESIDENTE_ACTIVO",
      exitType: null,
      employment: "NO_INFORMADO",
      consentPublic: false,
      nameVisibility: "CODE",
    },
    {
      code: "P-0003",
      nombres: "Juan",
      apellidos: "Pérez Muñoz",
      nacimiento: new Date("1994-01-22"),
      ingreso: new Date("2024-03-01"),
      egreso: new Date("2025-06-15"),
      status: "REINSERTADO",
      exitType: "REINSERCION",
      employment: "ESTUDIANDO",
      consentPublic: true,
      nameVisibility: "INITIALS",
    },
    {
      code: "P-0004",
      nombres: "Andrea",
      apellidos: "López Vera",
      nacimiento: new Date("1996-07-30"),
      ingreso: new Date("2023-08-05"),
      egreso: new Date("2023-11-01"),
      status: "ABANDONO",
      exitType: "ABANDONO",
      employment: "NO_INFORMADO",
      consentPublic: false,
      nameVisibility: "CODE",
    },
  ];

  const admin = await prisma.user.findUniqueOrThrow({ where: { email: "admin@reddecompasion.org" } });

  for (const d of demoPeople) {
    const exists = await prisma.person.findUnique({ where: { internalCode: d.code } });
    if (exists) continue;

    const person = await prisma.person.create({
      data: {
        internalCode: d.code,
        currentStatusCode: d.status,
        currentEmploymentStatus: d.employment as never,
        employmentStatusUpdatedAt: new Date(),
        identity: {
          create: {
            nombres: d.nombres,
            apellidos: d.apellidos,
            fechaNacimiento: d.nacimiento,
            comuna: "Comuna Ejemplo",
            region: "Región Ejemplo",
          },
        },
        publicSettings: { create: { nameVisibility: d.nameVisibility as never } },
        consent: {
          create: {
            allowPublicProfile: d.consentPublic,
            allowPhoto: false,
            allowName: d.consentPublic,
            allowAge: d.consentPublic,
            allowEntryYear: d.consentPublic,
            allowExitYear: d.consentPublic,
            allowReinsertionStatus: d.consentPublic,
            authorizedAt: d.consentPublic ? d.ingreso : null,
            authorizedById: d.consentPublic ? admin.id : null,
          },
        },
        entryInfo: {
          create: {
            fechaIngreso: d.ingreso,
            modalidadIngreso: "Voluntaria",
            responsableId: admin.id,
          },
        },
        exitInfo: d.egreso
          ? {
              create: {
                fechaEgreso: d.egreso,
                exitTypeCode: d.exitType ?? undefined,
                responsableId: admin.id,
              },
            }
          : undefined,
        statusHistory: {
          create: [
            { statusCode: "RESIDENTE_ACTIVO", fecha: d.ingreso, responsableId: admin.id, observaciones: "Ingreso al centro" },
            ...(d.status !== "RESIDENTE_ACTIVO"
              ? [{ statusCode: d.status, fecha: d.egreso ?? new Date(), responsableId: admin.id }]
              : []),
          ],
        },
      },
    });

    console.log(`Creada persona ${person.internalCode}`);
  }

  console.log("Seed completado. Usuarios demo (contraseña: cambiar123):");
  console.log("  super@reddecompasion.org (Super Administrador)");
  console.log("  admin@reddecompasion.org (Administrador)");
  console.log("  equipo@reddecompasion.org (Personal autorizado)");
  console.log("  visor@reddecompasion.org (Visualizador)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
