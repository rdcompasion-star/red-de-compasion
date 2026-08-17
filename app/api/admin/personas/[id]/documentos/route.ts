import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { apiErrorResponse } from "@/lib/apiError";
import { saveUploadedFile, ALLOWED_DOCUMENT_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/fileStorage";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    requirePermission(session?.user, "edit");
    const { id } = await params;

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const tipo = form.get("tipo") as string | null;
    const descripcion = form.get("descripcion") as string | null;

    if (!file || !tipo) return NextResponse.json({ error: "Archivo y tipo requeridos" }, { status: 400 });
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Formato no permitido. Use PDF, JPG, PNG o WEBP." }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "Archivo demasiado grande (máx 10MB)" }, { status: 400 });
    }

    const filePath = await saveUploadedFile(file, "documents");

    const doc = await prisma.document.create({
      data: {
        personId: id,
        tipo,
        nombreArchivo: file.name,
        filePath,
        descripcion: descripcion ?? undefined,
        uploadedById: session!.user.id,
      },
    });

    await logAudit({
      userId: session!.user.id,
      personId: id,
      action: "SUBIR_DOCUMENTO",
      module: "DOCUMENTOS",
      newValue: tipo,
    });

    return NextResponse.json({ documento: doc }, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
