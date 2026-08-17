import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_STATUS_OPTIONS, DEFAULT_EXIT_TYPES } from "../lib/domain";

const prisma = new PrismaClient();

/**
 * Seed minimo para produccion: solo catalogos base y un Super Administrador inicial.
 * No crea personas de ejemplo. Requiere SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD.
 */
async function main() {
  for (const s of DEFAULT_STATUS_OPTIONS) {
    await prisma.statusOption.upsert({ where: { code: s.code }, update: {}, create: s });
  }
  for (const t of DEFAULT_EXIT_TYPES) {
    await prisma.exitTypeOption.upsert({ where: { code: t.code }, update: {}, create: t });
  }

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("Catálogos creados. Define SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD para crear el Super Administrador inicial.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Super Administrador",
      email,
      passwordHash,
      role: "SUPER_ADMIN",
      canViewConfidential: true,
      canPublish: true,
      canExport: true,
      canDelete: true,
    },
  });

  console.log(`Super Administrador listo: ${email}. Cambia la contraseña después de tu primer ingreso.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
