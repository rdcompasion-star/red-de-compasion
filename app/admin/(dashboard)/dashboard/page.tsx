import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EntriesByYearChart, StatusPieChart } from "@/components/public/StatsCharts";

export default async function AdminDashboardPage() {
  const [total, archivados, statusOptions, people] = await Promise.all([
    prisma.person.count({ where: { archived: false } }),
    prisma.person.count({ where: { archived: true } }),
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

  const [faltaFotoIngreso, faltaFechaEgreso, faltaConsentimiento] = await Promise.all([
    prisma.person.count({ where: { archived: false, photos: { none: { tipo: "INGRESO" } } } }),
    prisma.person.count({
      where: {
        archived: false,
        currentStatusCode: { in: ["EGRESADO", "REINSERTADO", "REINSERTADO_TRABAJANDO"] },
        exitInfo: { is: null },
      },
    }),
    prisma.person.count({ where: { archived: false, consent: { is: null } } }),
  ]);

  const alertas = [
    faltaFotoIngreso > 0 && `${faltaFotoIngreso} persona(s) sin fotografía de ingreso`,
    faltaFechaEgreso > 0 && `${faltaFechaEgreso} persona(s) egresadas sin fecha de egreso registrada`,
    faltaConsentimiento > 0 && `${faltaConsentimiento} persona(s) sin autorización de publicación registrada`,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)]">¿Cómo estamos hoy?</h1>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1">Resumen general del centro</p>
        </div>
        <Link
          href="/admin/personas/nuevo"
          className="rounded-full bg-[var(--color-earth-600)] text-white px-4 py-2.5 text-sm font-medium hover:bg-[var(--color-earth-800)]"
        >
          + Nueva persona
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total registradas", value: total, href: "/admin/personas" },
          ...porEstado.map((e) => ({ label: e.label, value: e.count, href: `/admin/personas?estado=${e.code}` })),
          { label: "Archivadas", value: archivados, href: "/admin/personas?archived=true" },
        ].map((t, i) => (
          <Link
            key={t.label}
            href={t.href}
            style={{ animationDelay: `${i * 40}ms` }}
            className="animate-fade-in-up rounded-2xl border border-[var(--color-earth-100)] bg-[var(--color-paper)] p-4 text-center hover:border-[var(--color-earth-400)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="text-2xl font-semibold text-[var(--color-earth-800)]">{t.value}</div>
            <div className="mt-1 text-xs text-[var(--color-ink-soft)]">{t.label}</div>
          </Link>
        ))}
      </div>

      {alertas.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900 mb-1">Pendientes administrativos</p>
          <ul className="text-sm text-amber-800 list-disc list-inside space-y-0.5">
            {alertas.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}

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
