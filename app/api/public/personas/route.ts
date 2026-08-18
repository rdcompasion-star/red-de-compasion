import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildPublicProfile } from "@/lib/publicProfile";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get("anio");
  const status = searchParams.get("estado");

  const people = await prisma.person.findMany({
    where: {
      archived: false,
      consent: { allowPublicProfile: true, revokedAt: null },
      ...(status ? { currentStatusCode: status } : {}),
      ...(year
        ? { entryInfo: { fechaIngreso: { gte: new Date(`${year}-01-01`), lt: new Date(`${Number(year) + 1}-01-01`) } } }
        : {}),
    },
    include: {
      identity: true,
      publicSettings: true,
      consent: true,
      entryInfo: true,
      exitInfo: true,
      photos: { where: { publicAuthorized: true }, select: { id: true, tipo: true, publicAuthorized: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusOptions = await prisma.statusOption.findMany();
  const statusMap = Object.fromEntries(statusOptions.map((s) => [s.code, { label: s.label, colorHex: s.colorHex }]));

  const profiles = people.map((p) => buildPublicProfile(p, statusMap)).filter((p) => p !== null);

  return NextResponse.json({ personas: profiles });
}
