import { prisma } from "@/lib/prisma";
import { EntriesByYearChart, StatusPieChart } from "@/components/public/StatsCharts";

export default async function PublicStatsPage() {
  const [statusOptions, people] = await Promise.all([
    prisma.statusOption.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.person.findMany({
      where: { archived: false },
      select: { currentStatusCode: true, entryInfo: { select: { fechaIngreso: true } } },
    }),
  ]);

  const porEstado = statusOptions.map((s) => ({
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

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Estadísticas</h1>
        <p className="text-sm text-[var(--color-ink-soft)] mt-1">
          Datos agregados del proceso del centro. No se muestra información que permita identificar a una persona
          en particular.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[var(--color-earth-100)] bg-[var(--color-paper)] p-6">
          <h2 className="text-sm font-medium text-[var(--color-ink-soft)] mb-4">Ingresos por año</h2>
          <EntriesByYearChart data={porAnio} />
        </div>
        <div className="rounded-2xl border border-[var(--color-earth-100)] bg-[var(--color-paper)] p-6">
          <h2 className="text-sm font-medium text-[var(--color-ink-soft)] mb-4">Estado actual</h2>
          <StatusPieChart data={porEstado} />
        </div>
      </div>
    </div>
  );
}
