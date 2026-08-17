import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildPublicProfile } from "@/lib/publicProfile";
import { StatusBadge } from "@/components/StatusBadge";

export default async function PublicPersonPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const person = await prisma.person.findUnique({
    where: { internalCode: code },
    include: { identity: true, publicSettings: true, consent: true, entryInfo: true, exitInfo: true },
  });

  if (!person || person.archived) notFound();

  const statusOptions = await prisma.statusOption.findMany();
  const statusMap = Object.fromEntries(statusOptions.map((s) => [s.code, { label: s.label, colorHex: s.colorHex }]));
  const profile = buildPublicProfile(person, statusMap);
  if (!profile) notFound();

  let photos: { id: string; tipo: string }[] = [];
  if (person.consent?.allowPhoto) {
    photos = await prisma.photo.findMany({
      where: { personId: person.id, publicAuthorized: true },
      orderBy: { fecha: "asc" },
      select: { id: true, tipo: true },
    });
  }
  const ingresoFoto = photos.find((p) => p.tipo === "INGRESO");
  const egresoFoto = photos.find((p) => p.tipo === "EGRESO");

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <p className="text-xs uppercase tracking-wide text-[var(--color-earth-600)]">{profile.code}</p>
        <h1 className="text-3xl font-semibold text-[var(--color-ink)]">{profile.displayName}</h1>
        {profile.status && <StatusBadge label={profile.status.label} colorHex={profile.status.colorHex} />}
      </div>

      {(ingresoFoto || egresoFoto) && (
        <div>
          <h2 className="text-sm font-medium text-[var(--color-ink-soft)] text-center mb-3">Evolución</h2>
          <div className="grid grid-cols-2 gap-4">
            {ingresoFoto && (
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/public/fotos/${ingresoFoto.id}`}
                  alt="Fotografía de ingreso"
                  className="rounded-xl w-full aspect-square object-cover"
                />
                <figcaption className="text-center text-xs text-[var(--color-ink-soft)] mt-2">Ingreso</figcaption>
              </figure>
            )}
            {egresoFoto && (
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/public/fotos/${egresoFoto.id}`}
                  alt="Fotografía de egreso"
                  className="rounded-xl w-full aspect-square object-cover"
                />
                <figcaption className="text-center text-xs text-[var(--color-ink-soft)] mt-2">Egreso</figcaption>
              </figure>
            )}
          </div>
        </div>
      )}

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {profile.age !== null && (
          <div className="rounded-xl bg-[var(--color-earth-50)] p-4">
            <dt className="text-xs text-[var(--color-ink-soft)]">Edad</dt>
            <dd className="text-lg font-medium text-[var(--color-ink)]">{profile.age} años</dd>
          </div>
        )}
        {profile.entryYear !== null && (
          <div className="rounded-xl bg-[var(--color-earth-50)] p-4">
            <dt className="text-xs text-[var(--color-ink-soft)]">Año de ingreso</dt>
            <dd className="text-lg font-medium text-[var(--color-ink)]">{profile.entryYear}</dd>
          </div>
        )}
        {profile.exitYear !== null && (
          <div className="rounded-xl bg-[var(--color-earth-50)] p-4">
            <dt className="text-xs text-[var(--color-ink-soft)]">Año de egreso</dt>
            <dd className="text-lg font-medium text-[var(--color-ink)]">{profile.exitYear}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
