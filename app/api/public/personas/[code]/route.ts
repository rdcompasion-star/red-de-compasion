import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildPublicProfile } from "@/lib/publicProfile";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const person = await prisma.person.findUnique({
    where: { internalCode: code },
    include: { identity: true, publicSettings: true, consent: true, entryInfo: true, exitInfo: true },
  });

  if (!person || person.archived) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const statusOptions = await prisma.statusOption.findMany();
  const statusMap = Object.fromEntries(statusOptions.map((s) => [s.code, { label: s.label, colorHex: s.colorHex }]));

  const profile = buildPublicProfile(person, statusMap);
  if (!profile) {
    return NextResponse.json({ error: "No autorizada para publicación" }, { status: 404 });
  }

  let photos: { url: string; tipo: string }[] = [];
  if (person.consent?.allowPhoto) {
    const authorizedPhotos = await prisma.photo.findMany({
      where: { personId: person.id, publicAuthorized: true },
      orderBy: { fecha: "asc" },
    });
    photos = authorizedPhotos.map((ph) => ({ url: `/api/public/fotos/${ph.id}`, tipo: ph.tipo }));
  }

  return NextResponse.json({ ...profile, photos });
}
