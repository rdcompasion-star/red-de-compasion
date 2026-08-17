import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { apiErrorResponse } from "@/lib/apiError";
import { deleteUploadedFile } from "@/lib/fileStorage";
import { z } from "zod";

const schema = z.object({ publicAuthorized: z.boolean() });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    requirePermission(session?.user, "publish");
    const { id } = await params;
    const { publicAuthorized } = schema.parse(await req.json());

    const photo = await prisma.photo.update({ where: { id }, data: { publicAuthorized } });

    await logAudit({
      userId: session!.user.id,
      personId: photo.personId,
      action: publicAuthorized ? "AUTORIZAR_FOTO_PUBLICA" : "DESAUTORIZAR_FOTO_PUBLICA",
      module: "FOTOGRAFIAS",
    });

    return NextResponse.json({ foto: photo });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    requirePermission(session?.user, "delete");
    const { id } = await params;

    const photo = await prisma.photo.delete({ where: { id } });
    await deleteUploadedFile(photo.filePath);

    await logAudit({
      userId: session!.user.id,
      personId: photo.personId,
      action: "ELIMINAR_FOTO",
      module: "FOTOGRAFIAS",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
