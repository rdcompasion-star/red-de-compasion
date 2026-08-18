"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDatePublic } from "@/lib/domain";
import { EvolutionModal } from "@/components/public/EvolutionModal";

export function PersonCard({
  code,
  displayName,
  age,
  entryDate,
  exitDate,
  status,
  photoUrl,
  ingresoPhotoUrl,
  egresoPhotoUrl,
}: {
  code: string;
  displayName: string;
  age: number | null;
  entryDate: string | null;
  exitDate: string | null;
  status: { label: string; colorHex: string } | null;
  photoUrl?: string | null;
  ingresoPhotoUrl?: string | null;
  egresoPhotoUrl?: string | null;
}) {
  const [showEvolution, setShowEvolution] = useState(false);
  const hasEvolution = !!(ingresoPhotoUrl || egresoPhotoUrl);

  return (
    <Link
      href={`/personas/${code}`}
      className="animate-fade-in-up block rounded-2xl border border-[var(--color-earth-100)] bg-[var(--color-paper)] p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      {showEvolution && (
        <EvolutionModal
          displayName={displayName}
          ingresoPhotoUrl={ingresoPhotoUrl ?? null}
          egresoPhotoUrl={egresoPhotoUrl ?? null}
          code={code}
          onClose={() => setShowEvolution(false)}
        />
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={displayName}
              onClick={
                hasEvolution
                  ? (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowEvolution(true);
                    }
                  : undefined
              }
              className={`h-12 w-12 rounded-full object-cover shrink-0 ${hasEvolution ? "cursor-zoom-in" : ""}`}
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-[var(--color-earth-100)] flex items-center justify-center text-sm font-medium text-[var(--color-earth-800)] shrink-0">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-medium text-[var(--color-ink)]">{displayName}</h3>
            {age !== null && <p className="text-sm text-[var(--color-ink-soft)]">{age} años</p>}
          </div>
        </div>
        {status && <StatusBadge label={status.label} colorHex={status.colorHex} />}
      </div>
      <dl className="mt-4 flex gap-6 text-sm text-[var(--color-ink-soft)]">
        {entryDate && (
          <div>
            <dt className="text-xs uppercase tracking-wide">Ingresó</dt>
            <dd className="font-medium text-[var(--color-ink)]">{formatDatePublic(entryDate)}</dd>
          </div>
        )}
        {exitDate && (
          <div>
            <dt className="text-xs uppercase tracking-wide">Egresó</dt>
            <dd className="font-medium text-[var(--color-ink)]">{formatDatePublic(exitDate)}</dd>
          </div>
        )}
      </dl>
    </Link>
  );
}
