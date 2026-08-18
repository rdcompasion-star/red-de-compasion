import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";

export function PersonCard({
  code,
  displayName,
  age,
  entryYear,
  exitYear,
  status,
  photoUrl,
}: {
  code: string;
  displayName: string;
  age: number | null;
  entryYear: number | null;
  exitYear: number | null;
  status: { label: string; colorHex: string } | null;
  photoUrl?: string | null;
}) {
  return (
    <Link
      href={`/personas/${code}`}
      className="animate-fade-in-up block rounded-2xl border border-[var(--color-earth-100)] bg-[var(--color-paper)] p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={displayName} className="h-12 w-12 rounded-full object-cover shrink-0" />
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
        {entryYear && (
          <div>
            <dt className="text-xs uppercase tracking-wide">Ingresó</dt>
            <dd className="font-medium text-[var(--color-ink)]">{entryYear}</dd>
          </div>
        )}
        {exitYear && (
          <div>
            <dt className="text-xs uppercase tracking-wide">Egresó</dt>
            <dd className="font-medium text-[var(--color-ink)]">{exitYear}</dd>
          </div>
        )}
      </dl>
    </Link>
  );
}
