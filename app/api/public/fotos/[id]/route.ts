import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const photo = await prisma.photo.findUnique({
    where: { id },
    include: { person: { include: { consent: true } } },
  });

  // autorizacion verificada en tiempo real: si se revoca, deja de servirse de inmediato
  if (
    !photo ||
    !photo.publicAuthorized ||
    !photo.person.consent?.allowPhoto ||
    !photo.person.consent?.allowPublicProfile ||
    photo.person.consent?.revokedAt ||
    photo.person.archived
  ) {
    return NextResponse.json({ error: "No disponible" }, { status: 404 });
  }

  try {
    const blobRes = await fetch(photo.filePath);
    if (!blobRes.ok) throw new Error("no disponible en storage");
    const data = await blobRes.arrayBuffer();
    const ext = path.extname(new URL(photo.filePath).pathname).toLowerCase();
    const contentType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
    return new NextResponse(data, {
      headers: { "Content-Type": contentType, "Cache-Control": "private, max-age=60" },
    });
  } catch {
    return NextResponse.json({ error: "No disponible" }, { status: 404 });
  }
}
