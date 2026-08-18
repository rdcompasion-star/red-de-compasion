"use client";

import { createPortal } from "react-dom";
import Link from "next/link";

export function EvolutionModal({
  displayName,
  code,
  ingresoPhotoUrl,
  egresoPhotoUrl,
  onClose,
}: {
  displayName: string;
  code: string;
  ingresoPhotoUrl: string | null;
  egresoPhotoUrl: string | null;
  onClose: () => void;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 text-xl leading-none text-[var(--color-ink)] hover:bg-white"
      >
        ×
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-pop bg-[var(--color-cream)] rounded-2xl p-5 sm:p-6 max-w-sm w-full"
      >
        <p className="text-center font-medium text-[var(--color-ink)] mb-4">{displayName}</p>
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          {ingresoPhotoUrl && (
            <figure className="flex-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ingresoPhotoUrl}
                alt="Fotografía de ingreso"
                className="rounded-2xl w-full aspect-square object-cover shadow-md ring-1 ring-black/5"
              />
              <figcaption className="text-center text-xs font-medium text-[var(--color-ink-soft)] mt-2">Ingreso</figcaption>
            </figure>
          )}
          {ingresoPhotoUrl && egresoPhotoUrl && (
            <span className="text-2xl text-[var(--color-earth-400)] shrink-0" aria-hidden>
              →
            </span>
          )}
          {egresoPhotoUrl && (
            <figure className="flex-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={egresoPhotoUrl}
                alt="Fotografía de egreso"
                className="rounded-2xl w-full aspect-square object-cover shadow-md ring-1 ring-black/5"
              />
              <figcaption className="text-center text-xs font-medium text-[var(--color-ink-soft)] mt-2">Egreso</figcaption>
            </figure>
          )}
        </div>
        <Link
          href={`/personas/${code}`}
          className="mt-5 block text-center text-sm text-[var(--color-earth-600)] hover:underline"
        >
          Ver ficha completa →
        </Link>
      </div>
    </div>,
    document.body
  );
}
