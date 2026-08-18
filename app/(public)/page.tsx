import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const [total, statusOptions, people] = await Promise.all([
    prisma.person.count({ where: { archived: false } }),
    prisma.statusOption.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.person.findMany({ where: { archived: false }, select: { currentStatusCode: true } }),
  ]);

  const resumen = {
    residentesActivos: people.filter((p) => p.currentStatusCode === "RESIDENTE_ACTIVO").length,
    egresados: people.filter((p) => p.currentStatusCode === "EGRESADO").length,
    reinsertados: people.filter((p) => p.currentStatusCode === "REINSERTADO").length,
    reinsertadosTrabajando: people.filter((p) => p.currentStatusCode === "REINSERTADO_TRABAJANDO").length,
    abandonos: people.filter((p) => p.currentStatusCode === "ABANDONO").length,
  };

  const tiles = [
    { label: "Personas registradas", value: total, href: "/personas" },
    { label: "Residentes activos", value: resumen.residentesActivos, href: "/personas?estado=RESIDENTE_ACTIVO" },
    { label: "Egresados", value: resumen.egresados, href: "/personas?estado=EGRESADO" },
    { label: "Reinsertados", value: resumen.reinsertados, href: "/personas?estado=REINSERTADO" },
    {
      label: "Reinsertados y trabajando",
      value: resumen.reinsertadosTrabajando,
      href: "/personas?estado=REINSERTADO_TRABAJANDO",
    },
  ];

  return (
    <div className="space-y-14">
      <section className="text-center space-y-4 py-6">
        <p className="uppercase tracking-wide text-xs text-[var(--color-earth-600)] font-medium">Transparencia</p>
        <h1 className="font-display tracking-wide text-4xl sm:text-5xl text-[var(--color-ink)]">
          Personas que han pasado por nuestro proceso
        </h1>
        <p className="max-w-2xl mx-auto text-[var(--color-ink-soft)]">
          Este es un registro humano y transparente del trabajo de Red de Compasión. Mostramos resultados
          agregados y, cuando existe autorización expresa, algunas historias de proceso — siempre con respeto y
          dignidad.
        </p>
        {statusOptions.length === 0 ? null : (
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/personas"
              className="rounded-full bg-[var(--color-earth-600)] text-white px-5 py-2.5 text-sm font-medium hover:bg-[var(--color-earth-800)] transition"
            >
              Ver historias autorizadas
            </Link>
            <Link
              href="/estadisticas"
              className="rounded-full border border-[var(--color-earth-400)] text-[var(--color-earth-800)] px-5 py-2.5 text-sm font-medium hover:bg-[var(--color-earth-50)] transition"
            >
              Ver estadísticas
            </Link>
          </div>
        )}
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {tiles.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className="rounded-2xl border border-[var(--color-earth-100)] bg-[var(--color-paper)] p-5 text-center shadow-sm hover:border-[var(--color-earth-400)] hover:shadow-md transition"
          >
            <div className="text-3xl font-semibold text-[var(--color-earth-800)]">{t.value}</div>
            <div className="mt-1 text-xs text-[var(--color-ink-soft)]">{t.label}</div>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl bg-[var(--color-sage-100)] p-8 text-center space-y-2">
        <h2 className="text-lg font-medium text-[var(--color-sage-700)]">Nuestro compromiso</h2>
        <p className="max-w-2xl mx-auto text-sm text-[var(--color-ink-soft)]">
          Registramos procesos, no etiquetamos personas. La información aquí publicada respeta siempre la
          voluntad y la privacidad de cada persona que ha confiado en este centro.
        </p>
      </section>
    </div>
  );
}
