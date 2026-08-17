import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

/**
 * Cambia el estado de una persona SIN sobrescribir el pasado: agrega una entrada
 * al historial y luego actualiza el campo denormalizado currentStatusCode.
 */
export async function changePersonStatus(params: {
  personId: string;
  statusCode: string;
  customLabel?: string;
  fecha?: Date;
  responsableId?: string | null;
  observaciones?: string;
  actingUserId?: string | null;
}) {
  const person = await prisma.person.findUniqueOrThrow({ where: { id: params.personId } });

  await prisma.statusHistoryEntry.create({
    data: {
      personId: params.personId,
      statusCode: params.statusCode,
      customLabel: params.customLabel,
      fecha: params.fecha ?? new Date(),
      responsableId: params.responsableId ?? params.actingUserId ?? null,
      observaciones: params.observaciones,
    },
  });

  const updated = await prisma.person.update({
    where: { id: params.personId },
    data: { currentStatusCode: params.statusCode },
  });

  await logAudit({
    userId: params.actingUserId,
    personId: params.personId,
    action: "CAMBIO_ESTADO",
    module: "PERSONAS",
    field: "currentStatusCode",
    oldValue: person.currentStatusCode,
    newValue: params.statusCode,
  });

  return updated;
}

export async function updateEmploymentStatus(params: {
  personId: string;
  status: string;
  actingUserId?: string | null;
}) {
  const person = await prisma.person.findUniqueOrThrow({ where: { id: params.personId } });

  const updated = await prisma.person.update({
    where: { id: params.personId },
    data: {
      currentEmploymentStatus: params.status as never,
      employmentStatusUpdatedAt: new Date(),
    },
  });

  await logAudit({
    userId: params.actingUserId,
    personId: params.personId,
    action: "CAMBIO_SITUACION_LABORAL",
    module: "PERSONAS",
    field: "currentEmploymentStatus",
    oldValue: person.currentEmploymentStatus,
    newValue: params.status,
  });

  return updated;
}
