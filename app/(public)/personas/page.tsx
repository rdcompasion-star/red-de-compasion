import { prisma } from "@/lib/prisma";
import { buildPublicProfile } from "@/lib/publicProfile";
import { PersonCard } from "@/components/public/PersonCard";

export default async function PublicPersonasPage({
  searchParams,
}: {
  searchParams: Promise<{ anio?: string; estado?: string }>;
}) {
  const { anio, estado } = await searchParams;

  const [people, statusOptions] = await Promise.all([
    prisma.person.findMany({
      where: {
        archived: false,
        consent: { allowPublicProfile: true, revokedAt: null },
        ...(estado ? { currentStatusCode: estado } : {}),
        ...(anio
          ? { entryInfo: { fechaIngreso: { gte: new Date(`${anio}-01-01`), lt: new Date(`${Number(anio) + 1}-01-01`) } } }
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
    }),
    prisma.statusOption.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
  ]);

  const statusMap = Object.fromEntries(statusOptions.map((s) => [s.code, { label: s.label, colorHex: s.colorHex }]));
  const profiles = people.map((p) => buildPublicProfile(p, statusMap)).filter((p) => p !== null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display tracking-wide text-4xl text-[var(--color-ink)]">Historias autorizadas</h1>
        <p className="text-sm text-[var(--color-ink-soft)] mt-1">
          Solo se muestran perfiles con autorización expresa de la persona.
        </p>
      </div>

      <form className="flex flex-wrap gap-3" method="get">
        <select
          name="anio"
          defaultValue={anio ?? ""}
          className="rounded-lg border border-[var(--color-earth-100)] bg-[var(--color-paper)] px-3 py-2 text-sm"
        >
          <option value="">Todos los años</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          name="estado"
          defaultValue={estado ?? ""}
          className="rounded-lg border border-[var(--color-earth-100)] bg-[var(--color-paper)] px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          {statusOptions.map((s) => (
            <option key={s.code} value={s.code}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-[var(--color-earth-600)] text-white px-4 py-2 text-sm font-medium hover:bg-[var(--color-earth-800)]"
        >
          Filtrar
        </button>
      </form>

      {profiles.length === 0 ? (
        <p className="text-sm text-[var(--color-ink-soft)] py-10 text-center">
          No hay historias autorizadas para mostrar con estos filtros.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((p) => (
            <PersonCard key={p.code} {...p} />
          ))}
        </div>
      )}
    </div>
  );
}
