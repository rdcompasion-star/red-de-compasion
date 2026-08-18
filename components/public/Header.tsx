import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="border-b border-[var(--color-earth-100)] bg-[var(--color-paper)]">
      <div className="mx-auto max-w-5xl px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl" aria-hidden>
            🌿
          </span>
          <span className="hidden sm:inline font-semibold text-lg text-[var(--color-earth-800)]">Red de Compasión</span>
        </Link>
        <nav className="flex items-center gap-2.5 sm:gap-6 text-xs sm:text-sm text-[var(--color-ink-soft)]">
          <Link href="/" className="hover:text-[var(--color-earth-600)]">
            Inicio
          </Link>
          <Link href="/personas" className="hover:text-[var(--color-earth-600)]">
            Historias
          </Link>
          <Link href="/estadisticas" className="hover:text-[var(--color-earth-600)] whitespace-nowrap">
            Estadísticas
          </Link>
          <Link
            href="/admin/login"
            className="hover:text-[var(--color-earth-600)] border-l border-[var(--color-earth-100)] pl-2.5 sm:pl-6 whitespace-nowrap"
          >
            <span className="sm:hidden">Equipo</span>
            <span className="hidden sm:inline">Acceso equipo</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
