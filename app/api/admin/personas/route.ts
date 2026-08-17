import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { apiErrorResponse } from "@/lib/apiError";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    requirePermission(session?.user, "view");

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const anio = searchParams.get("anio");
    const estado = searchParams.get("estado");
    const archived = searchParams.get("archived") === "true";

    const people = await prisma.person.findMany({
      where: {
        archived,
        ...(estado ? { currentStatusCode: estado } : {}),
        ...(anio
          ? { entryInfo: { fechaIngreso: { gte: new Date(`${anio}-01-01`), lt: new Date(`${Number(anio) + 1}-01-01`) } } }
          : {}),
        ...(q
          ? {
              OR: [
                { internalCode: { contains: q } },
                { identity: { nombres: { contains: q } } },
                { identity: { apellidos: { contains: q } } },
                { identity: { rut: { contains: q } } },
              ],
            }
          : {}),
      },
      include: { identity: true, entryInfo: true, exitInfo: true },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ personas: people });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

const createSchema = z.object({
  nombres: z.string().min(1),
  apellidos: z.string().min(1),
  fechaNacimiento: z.string().optional(),
  rut: z.string().optional(),
  fechaIngreso: z.string(),
  modalidadIngreso: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    requirePermission(session?.user, "create");

    const body = await req.json();
    const data = createSchema.parse(body);

    const count = await prisma.person.count();
    const internalCode = `P-${String(count + 1).padStart(4, "0")}`;

    const person = await prisma.person.create({
      data: {
        internalCode,
        currentStatusCode: "RESIDENTE_ACTIVO",
        identity: {
          create: {
            nombres: data.nombres,
            apellidos: data.apellidos,
            fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
            rut: data.rut,
          },
        },
        publicSettings: { create: {} },
        consent: { create: {} },
        entryInfo: {
          create: {
            fechaIngreso: new Date(data.fechaIngreso),
            modalidadIngreso: data.modalidadIngreso,
            responsableId: session!.user.id,
          },
        },
        statusHistory: {
          create: [
            {
              statusCode: "RESIDENTE_ACTIVO",
              fecha: new Date(data.fechaIngreso),
              responsableId: session!.user.id,
              observaciones: "Ingreso al centro",
            },
          ],
        },
      },
    });

    await logAudit({
      userId: session!.user.id,
      personId: person.id,
      action: "CREAR_PERSONA",
      module: "PERSONAS",
      newValue: internalCode,
    });

    return NextResponse.json({ persona: person }, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
