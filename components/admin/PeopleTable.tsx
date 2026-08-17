"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { calcAge } from "@/lib/domain";

type PersonRow = {
  id: string;
  internalCode: string;
  currentStatusCode: string;
  identity: { nombres: string; apellidos: string; fechaNacimiento: string | null } | null;
  entryInfo: { fechaIngreso: string } | null;
  exitInfo: { fechaEgreso: string | null } | null;
  updatedAt: string;
};

const STATUS_LABELS: Record<string, { label: string; colorHex: string }> = {
  RESIDENTE_ACTIVO: { label: "Residente activo", colorHex: "#2f9e6e" },
  EGRESADO: { label: "Egresado", colorHex: "#3b6ea5" },
  REINSERTADO: { label: "Reinsertado", colorHex: "#7c5cbf" },
  REINSERTADO_TRABAJANDO: { label: "Reinsertado + trabajando", colorHex: "#3f9142" },
  ABANDONO: { label: "Abandonó", colorHex: "#8a8a8a" },
};

export function PeopleTable() {
  const [people, setPeople] = useState<PersonRow[]>([]);
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (estado) params.set("estado", estado);
    const res = await fetch(`/api/admin/personas?${params.toString()}`);
    const data = await res.json();
    setPeople(data.personas ?? []);
    setLoading(false);
  }, [q, estado]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-4">
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
          {Object.entries(STATUS_LABELS).map(([code, s]) => (
            <option key={code} value={code}>
              {s.label}
            </option>
          ))}
        </select>
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
                {people.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--color-earth-100)] last:border-0">
                    <td className="p-3">
                      <div className="font-medium text-[var(--color-ink)]">
                        {p.identity ? `${p.identity.nombres} ${p.identity.apellidos}` : p.internalCode}
                      </div>
                      <div className="text-xs text-[var(--color-ink-soft)]">{p.internalCode}</div>
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
                ))}
              </tbody>
            </table>
          </div>

          {/* tarjetas en mobile */}
          <div className="sm:hidden space-y-3">
            {people.map((p) => (
              <Link
                key={p.id}
                href={`/admin/personas/${p.id}`}
                className="block rounded-2xl border border-[var(--color-earth-100)] bg-[var(--color-paper)] p-4"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">
                      {p.identity ? `${p.identity.nombres} ${p.identity.apellidos}` : p.internalCode}
                    </p>
                    <p className="text-xs text-[var(--color-ink-soft)]">{p.internalCode}</p>
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
            ))}
          </div>
        </>
      )}
    </div>
  );
}
