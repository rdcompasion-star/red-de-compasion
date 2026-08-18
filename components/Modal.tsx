"use client";

import { createPortal } from "react-dom";

export function ImageModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
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
        className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 text-xl leading-none text-[var(--color-ink)] hover:bg-white transition-transform hover:scale-105"
      >
        ×
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl animate-modal-pop"
      />
    </div>,
    document.body
  );
}
