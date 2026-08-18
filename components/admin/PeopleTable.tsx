"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { ImageModal } from "@/components/Modal";
import { calcAge } from "@/lib/domain";

type PersonRow = {
  id: string;
  internalCode: string;
  currentStatusCode: string;
  identity: { nombres: string; apellidos: string; fechaNacimiento: string | null } | null;
  entryInfo: { fechaIngreso: string } | null;
  exitInfo: { fechaEgreso: string | null } | null;
  photos: { id: string; tipo: string }[];
  updatedAt: string;
};

// incluye codigos historicos (ej. REINSERTADO) solo para poder mostrar el label
// de personas que ya tenian ese estado asignado antes de retirarlo de las opciones
const STATUS_LABELS: Record<string, { label: string; colorHex: string }> = {
  RESIDENTE_ACTIVO: { label: "Residente activo", colorHex: "#2f9e6e" },
  EGRESADO: { label: "Egresado", colorHex: "#3b6ea5" },
  REINSERTADO: { label: "Reinsertado", colorHex: "#7c5cbf" },
  REINSERTADO_TRABAJANDO: { label: "Reinsertado + trabajando", colorHex: "#3f9142" },
  ABANDONO: { label: "Abandonó", colorHex: "#8a8a8a" },
};
const SELECTABLE_STATUS_ENTRIES = Object.entries(STATUS_LABELS).filter(([code]) => code !== "REINSERTADO");

function bestPhoto(photos: { id: string; tipo: string }[]) {
  return photos.find((p) => p.tipo === "INGRESO") ?? photos[0] ?? null;
}

function Avatar({ photo, name }: { photo: { id: string; tipo: string } | null; name: string }) {
  if (!photo) {
    return (
      <div className="h-10 w-10 shrink-0 rounded-full bg-[var(--color-earth-100)] flex items-center justify-center text-xs font-medium text-[var(--color-earth-800)]">
        {name.slice(0, 1).toUpperCase()}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/admin/files/fotos/${photo.id}`}
      alt={name}
      className="h-10 w-10 shrink-0 rounded-full object-cover cursor-zoom-in"
    />
  );
}

export function PeopleTable() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [people, setPeople] = useState<PersonRow[]>([]);
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [estado, setEstado] = useState(searchParams.get("estado") ?? "");
  const [archived, setArchived] = useState(searchParams.get("archived") === "true");
  const [loading, setLoading] = useState(true);
  const [zoomedPhoto, setZoomedPhoto] = useState<{ id: string; name: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (estado) params.set("estado", estado);
    if (archived) params.set("archived", "true");
    const res = await fetch(`/api/admin/personas?${params.toString()}`);
    const data = await res.json();
    setPeople(data.personas ?? []);
    setLoading(false);
  }, [q, estado, archived]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (estado) next.set("estado", estado);
    if (archived) next.set("archived", "true");
    const qs = next.toString();
    router.replace(qs ? `/admin/personas?${qs}` : "/admin/personas", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, estado, archived]);

  function openPhoto(photo: { id: string; tipo: string } | null, name: string) {
    if (!photo) return;
    setZoomedPhoto({ id: photo.id, name });
  }

  return (
    <div className="space-y-4">
      {zoomedPhoto && (
        <ImageModal
          src={`/api/admin/files/fotos/${zoomedPhoto.id}`}
          alt={zoomedPhoto.name}
          onClose={() => setZoomedPhoto(null)}
        />
      )}

      <div className="flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔎 Buscar por nombre, ID o RUT"
          className="flex-1 min-w-[200px] rounded-lg border border-[var(--color-earth-100)] px-3 py-2.5 text-sm"
        />
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="rounded-lg border border-[var(--color-earth-100)] px-3 py-2.5 text-sm"
        >
          <option value="">Todos los estados</option>
          {SELECTABLE_STATUS_ENTRIES.map(([code, s]) => (
            <option key={code} value={code}>
              {s.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-[var(--color-ink-soft)] px-1">
          <input type="checkbox" checked={archived} onChange={(e) => setArchived(e.target.checked)} />
          Ver archivadas
        </label>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--color-ink-soft)]">Cargando...</p>
      ) : people.length === 0 ? (
        <p className="text-sm text-[var(--color-ink-soft)] py-10 text-center">No se encontraron personas.</p>
      ) : (
        <>
          {/* tabla en desktop */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-[var(--color-earth-100)] bg-[var(--color-paper)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[var(--color-ink-soft)] border-b border-[var(--color-earth-100)]">
                  <th className="p-3">Persona</th>
                  <th className="p-3">Ingreso</th>
                  <th className="p-3">Egreso</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Actualizado</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {people.map((p) => {
                  const name = p.identity ? `${p.identity.nombres} ${p.identity.apellidos}` : p.internalCode;
                  const photo = bestPhoto(p.photos);
                  return (
                    <tr key={p.id} className="border-b border-[var(--color-earth-100)] last:border-0">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <button onClick={() => openPhoto(photo, name)} disabled={!photo} className="rounded-full">
                            <Avatar photo={photo} name={name} />
                          </button>
                          <div>
                            <div className="font-medium text-[var(--color-ink)]">{name}</div>
                            <div className="text-xs text-[var(--color-ink-soft)]">{p.internalCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{p.entryInfo ? new Date(p.entryInfo.fechaIngreso).toLocaleDateString("es-CL") : "—"}</td>
                      <td className="p-3">
                        {p.exitInfo?.fechaEgreso ? new Date(p.exitInfo.fechaEgreso).toLocaleDateString("es-CL") : "—"}
                      </td>
                      <td className="p-3">
                        <StatusBadge
                          label={STATUS_LABELS[p.currentStatusCode]?.label ?? p.currentStatusCode}
                          colorHex={STATUS_LABELS[p.currentStatusCode]?.colorHex}
                        />
                      </td>
                      <td className="p-3 text-xs text-[var(--color-ink-soft)]">{new Date(p.updatedAt).toLocaleDateString("es-CL")}</td>
                      <td className="p-3 text-right">
                        <Link href={`/admin/personas/${p.id}`} className="text-[var(--color-earth-600)] hover:underline text-sm">
                          Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* tarjetas en mobile */}
          <div className="sm:hidden space-y-3">
            {people.map((p) => {
              const name = p.identity ? `${p.identity.nombres} ${p.identity.apellidos}` : p.internalCode;
              const photo = bestPhoto(p.photos);
              return (
                <Link
                  key={p.id}
                  href={`/admin/personas/${p.id}`}
                  className="animate-fade-in-up block rounded-2xl border border-[var(--color-earth-100)] bg-[var(--color-paper)] p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <span
                        onClick={(e) => {
                          if (!photo) return;
                          e.preventDefault();
                          e.stopPropagation();
                          openPhoto(photo, name);
                        }}
                      >
                        <Avatar photo={photo} name={name} />
                      </span>
                      <div>
                        <p className="font-medium text-[var(--color-ink)]">{name}</p>
                        <p className="text-xs text-[var(--color-ink-soft)]">{p.internalCode}</p>
                      </div>
                    </div>
                    <StatusBadge
                      label={STATUS_LABELS[p.currentStatusCode]?.label ?? p.currentStatusCode}
                      colorHex={STATUS_LABELS[p.currentStatusCode]?.colorHex}
                    />
                  </div>
                  {p.identity?.fechaNacimiento && (
                    <p className="text-xs text-[var(--color-ink-soft)] mt-2">{calcAge(p.identity.fechaNacimiento)} años</p>
                  )}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
