import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [total, statusOptions, people] = await Promise.all([
    prisma.person.count({ where: { archived: false } }),
    prisma.statusOption.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.person.findMany({
      where: { archived: false },
      select: { currentStatusCode: true, entryInfo: { select: { fechaIngreso: true } } },
    }),
  ]);

  const porEstado = statusOptions.map((s) => ({
    code: s.code,
    label: s.label,
    colorHex: s.colorHex,
    count: people.filter((p) => p.currentStatusCode === s.code).length,
  }));

  const anioCounts = new Map<number, number>();
  for (const p of people) {
    const y = p.entryInfo?.fechaIngreso?.getFullYear();
    if (!y) continue;
    anioCounts.set(y, (anioCounts.get(y) ?? 0) + 1);
  }
  const porAnio = Array.from(anioCounts.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([year, count]) => ({ year, count }));

  const resumen = {
    total,
    residentesActivos: porEstado.find((e) => e.code === "RESIDENTE_ACTIVO")?.count ?? 0,
    egresados: porEstado.find((e) => e.code === "EGRESADO")?.count ?? 0,
    reinsertados: porEstado.find((e) => e.code === "REINSERTADO")?.count ?? 0,
    reinsertadosTrabajando: porEstado.find((e) => e.code === "REINSERTADO_TRABAJANDO")?.count ?? 0,
    abandonos: porEstado.find((e) => e.code === "ABANDONO")?.count ?? 0,
  };

  return NextResponse.json({ resumen, porEstado, porAnio });
}
