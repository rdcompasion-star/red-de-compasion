import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/permissions";
import path from "path";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!can(session.user, "view")) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { type, id } = await params;

  let blobUrl: string | null = null;
  let originalName: string | null = null;

  if (type === "fotos") {
    const photo = await prisma.photo.findUnique({ where: { id } });
    if (photo) blobUrl = photo.filePath;
  } else if (type === "documentos") {
    const doc = await prisma.document.findUnique({ where: { id } });
    if (doc) {
      blobUrl = doc.filePath;
      originalName = doc.nombreArchivo;
    }
  } else {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  }

  if (!blobUrl) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  try {
    // el contenido se reenvia desde el storage privado: la URL del blob nunca se expone al cliente
    const blobRes = await fetch(blobUrl);
    if (!blobRes.ok) throw new Error("no disponible en storage");
    const data = await blobRes.arrayBuffer();
    const ext = path.extname(new URL(blobUrl).pathname).toLowerCase();
    const contentType =
      ext === ".png" ? "image/png" :
      ext === ".webp" ? "image/webp" :
      ext === ".pdf" ? "application/pdf" :
      ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
      "application/octet-stream";

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${originalName ?? path.basename(new URL(blobUrl).pathname)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
}
