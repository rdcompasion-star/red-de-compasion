import { prisma } from "@/lib/prisma";
import { EntriesByYearChart, StatusPieChart } from "@/components/public/StatsCharts";
import { EMPLOYMENT_LABELS } from "@/lib/domain";

export const dynamic = "force-dynamic";

const EMPLOYMENT_COLORS: Record<string, string> = {
  TRABAJANDO: "#3f9142",
  INDEPENDIENTE: "#5f9c73",
  ESTUDIA_Y_TRABAJA: "#5a8cb0",
  ESTUDIANDO: "#3a6485",
  BUSCA_EMPLEO: "#b98d5e",
  NO_TRABAJA: "#8a8a8a",
  OTRA: "#7c5cbf",
  NO_INFORMADO: "#c9c2b8",
};

export default async function PublicStatsPage() {
  const [statusOptions, people] = await Promise.all([
    prisma.statusOption.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.person.findMany({
      where: { archived: false },
      select: {
        currentStatusCode: true,
        currentEmploymentStatus: true,
        entryInfo: { select: { fechaIngreso: true } },
        exitInfo: { select: { fechaEgreso: true } },
      },
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

  const employmentCounts = new Map<string, number>();
  for (const p of people) {
    const key = p.currentEmploymentStatus;
    employmentCounts.set(key, (employmentCounts.get(key) ?? 0) + 1);
  }
  const porSituacionLaboral = Object.entries(EMPLOYMENT_LABELS)
    .map(([code, label]) => ({ label, colorHex: EMPLOYMENT_COLORS[code], count: employmentCounts.get(code) ?? 0 }))
    .filter((e) => e.count > 0);

  // KPIs
  const total = people.length;
  const trabajando = people.filter((p) => ["TRABAJANDO", "INDEPENDIENTE", "ESTUDIA_Y_TRABAJA"].includes(p.currentEmploymentStatus)).length;
  const reinsertados = people.filter((p) => ["REINSERTADO", "REINSERTADO_TRABAJANDO"].includes(p.currentStatusCode)).length;
  const egresosTotales = people.filter((p) => p.exitInfo?.fechaEgreso).length;
  const tasaReinsercion = egresosTotales > 0 ? Math.round((reinsertados / egresosTotales) * 100) : null;

  const durations: number[] = [];
  for (const p of people) {
    if (!p.entryInfo?.fechaIngreso || !p.exitInfo?.fechaEgreso) continue;
    const start = new Date(p.entryInfo.fechaIngreso);
    const end = new Date(p.exitInfo.fechaEgreso);
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (months < 0) months = 0;
    durations.push(months);
  }
  const avgMonths = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null;
  const avgDurationLabel =
    avgMonths === null
      ? "—"
      : avgMonths >= 12
      ? `${Math.round(avgMonths / 12)} ${Math.round(avgMonths / 12) === 1 ? "año" : "años"}`
      : `${avgMonths} meses`;

  const kpis = [
    { label: "Personas registradas", value: String(total) },
    { label: "Reinserción sobre egresos", value: tasaReinsercion !== null ? `${tasaReinsercion}%` : "—" },
    { label: "Actualmente trabajando", value: String(trabajando) },
    { label: "Duración promedio del proceso", value: avgDurationLabel },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display tracking-wide text-4xl text-[var(--color-ink)]">Estadísticas</h1>
        <p className="text-sm text-[var(--color-ink-soft)] mt-1">
          Datos agregados del proceso del centro. No se muestra información que permita identificar a una persona
          en particular.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-[var(--color-earth-100)] bg-[var(--color-paper)] p-5 text-center">
            <div className="text-2xl sm:text-3xl font-semibold text-[var(--color-earth-800)]">{k.value}</div>
            <div className="mt-1 text-xs text-[var(--color-ink-soft)]">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[var(--color-earth-100)] bg-[var(--color-paper)] p-6">
          <h2 className="text-sm font-medium text-[var(--color-ink-soft)] mb-4">Ingresos por año</h2>
          <EntriesByYearChart data={porAnio} />
        </div>

        <div className="rounded-2xl border border-[var(--color-earth-100)] bg-[var(--color-paper)] p-6">
          <h2 className="text-sm font-medium text-[var(--color-ink-soft)] mb-4">Estado actual</h2>
          <StatusPieChart data={porEstado} />
          <ul className="mt-3 space-y-1.5">
            {porEstado
              .filter((e) => e.count > 0)
              .map((e) => (
                <li key={e.code} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-[var(--color-ink)]">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: e.colorHex }} aria-hidden />
                    {e.label}
                  </span>
                  <span className="font-medium text-[var(--color-ink)]">{e.count}</span>
                </li>
              ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-[var(--color-earth-100)] bg-[var(--color-paper)] p-6 md:col-span-2">
          <h2 className="text-sm font-medium text-[var(--color-ink-soft)] mb-4">Situación laboral actual</h2>
          {porSituacionLaboral.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-soft)]">Sin datos aún.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <StatusPieChart data={porSituacionLaboral} />
              <ul className="space-y-1.5">
                {porSituacionLaboral.map((e) => (
                  <li key={e.label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-[var(--color-ink)]">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: e.colorHex }} aria-hidden />
                      {e.label}
                    </span>
                    <span className="font-medium text-[var(--color-ink)]">{e.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
