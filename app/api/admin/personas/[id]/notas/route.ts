import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { apiErrorResponse } from "@/lib/apiError";
import { z } from "zod";

const schema = z.object({ contenido: z.string().min(1), correctedFromId: z.string().optional() });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    requirePermission(session?.user, "edit");
    const { id } = await params;
    const data = schema.parse(await req.json());

    const nota = await prisma.internalNote.create({
      data: {
        personId: id,
        autorId: session!.user.id,
        contenido: data.contenido,
        correctedFromId: data.correctedFromId,
      },
    });

    await logAudit({
      userId: session!.user.id,
      personId: id,
      action: data.correctedFromId ? "CORREGIR_NOTA" : "CREAR_NOTA",
      module: "NOTAS_INTERNAS",
    });

    return NextResponse.json({ nota }, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
