import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { apiErrorResponse } from "@/lib/apiError";

export async function GET() {
  try {
    const session = await auth();
    requirePermission(session?.user, "view");

    const [total, archivados, statusOptions, people, alertasFaltaFotoIngreso, alertasFaltaEgresoFecha, alertasFaltaConsentimiento] =
      await Promise.all([
        prisma.person.count({ where: { archived: false } }),
        prisma.person.count({ where: { archived: true } }),
        prisma.statusOption.findMany({ orderBy: { order: "asc" } }),
        prisma.person.findMany({
          where: { archived: false },
          select: { currentStatusCode: true, currentEmploymentStatus: true, entryInfo: { select: { fechaIngreso: true } } },
        }),
        prisma.person.count({ where: { archived: false, photos: { none: { tipo: "INGRESO" } } } }),
        prisma.person.count({
          where: { archived: false, currentStatusCode: { in: ["EGRESADO", "REINSERTADO", "REINSERTADO_TRABAJANDO"] }, exitInfo: { is: null } },
        }),
        prisma.person.count({ where: { archived: false, consent: { is: null } } }),
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

    return NextResponse.json({
      total,
      archivados,
      porEstado,
      porAnio,
      alertas: {
        faltaFotoIngreso: alertasFaltaFotoIngreso,
        faltaFechaEgreso: alertasFaltaEgresoFecha,
        faltaAutorizacionPublicacion: alertasFaltaConsentimiento,
      },
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
