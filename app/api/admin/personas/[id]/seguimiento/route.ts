import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { updateEmploymentStatus } from "@/lib/personStatus";
import { apiErrorResponse } from "@/lib/apiError";
import { z } from "zod";

const schema = z.object({
  fecha: z.string().optional(),
  vivienda: z.string().optional(),
  empleo: z
    .enum(["NO_TRABAJA", "BUSCA_EMPLEO", "TRABAJANDO", "INDEPENDIENTE", "ESTUDIANDO", "ESTUDIA_Y_TRABAJA", "OTRA", "NO_INFORMADO"])
    .optional(),
  estudios: z.string().optional(),
  redApoyo: z.string().optional(),
  continuidadAcompanamiento: z.string().optional(),
  observaciones: z.string().optional(),
  proximaRevision: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    requirePermission(session?.user, "edit");
    const { id } = await params;
    const data = schema.parse(await req.json());

    const followUp = await prisma.followUp.create({
      data: {
        personId: id,
        fecha: data.fecha ? new Date(data.fecha) : new Date(),
        vivienda: data.vivienda,
        empleo: data.empleo as never,
        estudios: data.estudios,
        redApoyo: data.redApoyo,
        continuidadAcompanamiento: data.continuidadAcompanamiento,
        observaciones: data.observaciones,
        proximaRevision: data.proximaRevision ? new Date(data.proximaRevision) : undefined,
        registradoPorId: session!.user.id,
      },
    });

    if (data.empleo) {
      await updateEmploymentStatus({ personId: id, status: data.empleo, actingUserId: session!.user.id });
    }

    await logAudit({
      userId: session!.user.id,
      personId: id,
      action: "REGISTRAR_SEGUIMIENTO",
      module: "SEGUIMIENTO",
    });

    return NextResponse.json({ seguimiento: followUp }, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
