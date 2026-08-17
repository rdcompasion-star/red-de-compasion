import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { apiErrorResponse } from "@/lib/apiError";
import { z } from "zod";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    requirePermission(session?.user, "viewConfidential");
    const { id } = await params;

    const [definitions, entries] = await Promise.all([
      prisma.confidentialFieldDefinition.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
      prisma.confidentialEntry.findMany({ where: { personId: id } }),
    ]);

    return NextResponse.json({ definiciones: definitions, valores: entries });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

const schema = z.object({ fieldKey: z.string(), valor: z.string() });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    requirePermission(session?.user, "editConfidential");
    const { id } = await params;
    const { fieldKey, valor } = schema.parse(await req.json());

    const entry = await prisma.confidentialEntry.upsert({
      where: { personId_fieldKey: { personId: id, fieldKey } },
      create: { personId: id, fieldKey, valor, updatedById: session!.user.id },
      update: { valor, updatedById: session!.user.id },
    });

    await logAudit({
      userId: session!.user.id,
      personId: id,
      action: "ACTUALIZAR_CAMPO_CONFIDENCIAL",
      module: "CONFIDENCIAL",
      field: fieldKey,
    });

    return NextResponse.json({ valor: entry });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
