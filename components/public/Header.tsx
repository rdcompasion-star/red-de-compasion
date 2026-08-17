import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="border-b border-[var(--color-earth-100)] bg-[var(--color-paper)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            🌿
          </span>
          <span className="font-semibold text-lg text-[var(--color-earth-800)]">Red de Compasión</span>
        </Link>
        <nav className="flex gap-4 sm:gap-6 text-sm text-[var(--color-ink-soft)]">
          <Link href="/" className="hover:text-[var(--color-earth-600)]">
            Inicio
          </Link>
          <Link href="/personas" className="hover:text-[var(--color-earth-600)]">
            Historias
          </Link>
          <Link href="/estadisticas" className="hover:text-[var(--color-earth-600)]">
            Estadísticas
          </Link>
          <Link
            href="/admin/login"
            className="hover:text-[var(--color-earth-600)] border-l border-[var(--color-earth-100)] pl-4 sm:pl-6"
          >
            Acceso equipo
          </Link>
        </nav>
      </div>
    </header>
  );
}
