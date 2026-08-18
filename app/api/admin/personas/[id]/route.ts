import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { can, requirePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { apiErrorResponse } from "@/lib/apiError";
import { deleteUploadedFile } from "@/lib/fileStorage";
import { z } from "zod";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    requirePermission(session?.user, "view");
    const { id } = await params;

    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        identity: true,
        publicSettings: true,
        consent: true,
        entryInfo: true,
        exitInfo: true,
        statusHistory: { orderBy: { fecha: "desc" } },
        processStages: { orderBy: { fechaInicio: "desc" } },
        followUps: { orderBy: { fecha: "desc" } },
        photos: { orderBy: { fecha: "desc" } },
        documents: { orderBy: { createdAt: "desc" } },
        internalNotes: { orderBy: { fecha: "desc" } },
        confidentialEntries: can(session?.user, "viewConfidential") ? true : false,
      },
    });

    if (!person) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

    return NextResponse.json({ persona: person });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

const updateSchema = z.object({
  identity: z
    .object({
      nombres: z.string().optional(),
      apellidos: z.string().optional(),
      fechaNacimiento: z.string().nullable().optional(),
      sexo: z.string().nullable().optional(),
      rut: z.string().nullable().optional(),
      nacionalidad: z.string().nullable().optional(),
      comuna: z.string().nullable().optional(),
      region: z.string().nullable().optional(),
      telefono: z.string().nullable().optional(),
      correo: z.string().nullable().optional(),
      direccion: z.string().nullable().optional(),
      contactoEmergenciaNombre: z.string().nullable().optional(),
      contactoEmergenciaTelefono: z.string().nullable().optional(),
      contactoEmergenciaRelacion: z.string().nullable().optional(),
    })
    .optional(),
  publicSettings: z
    .object({
      nameVisibility: z.enum(["FULL", "FIRST_NAME", "INITIALS", "CODE"]).optional(),
      publicDisplayNameOverride: z.string().nullable().optional(),
    })
    .optional(),
  entryInfo: z
    .object({
      fechaIngreso: z.string().optional(),
      modalidadIngreso: z.string().nullable().optional(),
      motivoDerivacion: z.string().nullable().optional(),
    })
    .optional(),
  exitInfo: z
    .object({
      fechaEgreso: z.string().nullable().optional(),
      exitTypeCode: z.string().nullable().optional(),
      motivoEgreso: z.string().nullable().optional(),
      observaciones: z.string().nullable().optional(),
    })
    .optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    requirePermission(session?.user, "edit");
    const { id } = await params;

    const body = await req.json();
    const data = updateSchema.parse(body);

    if (data.identity) {
      await prisma.personIdentity.update({
        where: { personId: id },
        data: {
          ...data.identity,
          fechaNacimiento: data.identity.fechaNacimiento ? new Date(data.identity.fechaNacimiento) : data.identity.fechaNacimiento,
        },
      });
    }
    if (data.publicSettings) {
      requirePermission(session?.user, "publish");
      await prisma.personPublicSettings.update({ where: { personId: id }, data: data.publicSettings });
    }
    if (data.entryInfo) {
      await prisma.personEntry.update({
        where: { personId: id },
        data: {
          ...data.entryInfo,
          fechaIngreso: data.entryInfo.fechaIngreso ? new Date(data.entryInfo.fechaIngreso) : undefined,
        },
      });
    }
    if (data.exitInfo) {
      await prisma.personExit.upsert({
        where: { personId: id },
        create: {
          personId: id,
          fechaEgreso: data.exitInfo.fechaEgreso ? new Date(data.exitInfo.fechaEgreso) : null,
          exitTypeCode: data.exitInfo.exitTypeCode,
          motivoEgreso: data.exitInfo.motivoEgreso,
          responsableId: session!.user.id,
        },
        update: {
          ...data.exitInfo,
          fechaEgreso: data.exitInfo.fechaEgreso ? new Date(data.exitInfo.fechaEgreso) : data.exitInfo.fechaEgreso,
        },
      });
    }

    await logAudit({
      userId: session!.user.id,
      personId: id,
      action: "EDITAR_PERSONA",
      module: "PERSONAS",
      newValue: JSON.stringify(Object.keys(data)),
    });

    const updated = await prisma.person.findUnique({
      where: { id },
      include: { identity: true, publicSettings: true, entryInfo: true, exitInfo: true },
    });

    return NextResponse.json({ persona: updated });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const { id } = await params;
    const hard = new URL(req.url).searchParams.get("hard") === "true";

    if (hard) {
      requirePermission(session?.user, "delete");

      const person = await prisma.person.findUniqueOrThrow({
        where: { id },
        include: { photos: true, documents: true },
      });

      await logAudit({
        userId: session!.user.id,
        personId: id,
        action: "ELIMINAR_PERSONA_DEFINITIVO",
        module: "PERSONAS",
        oldValue: person.internalCode,
      });

      for (const ph of person.photos) await deleteUploadedFile(ph.filePath);
      for (const doc of person.documents) await deleteUploadedFile(doc.filePath);

      await prisma.person.delete({ where: { id } });

      return NextResponse.json({ ok: true });
    }

    requirePermission(session?.user, "archive");

    const updated = await prisma.person.update({
      where: { id },
      data: { archived: true, archivedAt: new Date(), archivedById: session!.user.id },
    });

    await logAudit({
      userId: session!.user.id,
      personId: id,
      action: "ARCHIVAR_PERSONA",
      module: "PERSONAS",
    });

    return NextResponse.json({ persona: updated });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
