import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";

export function PersonCard({
  code,
  displayName,
  age,
  entryYear,
  exitYear,
  status,
}: {
  code: string;
  displayName: string;
  age: number | null;
  entryYear: number | null;
  exitYear: number | null;
  status: { label: string; colorHex: string } | null;
}) {
  return (
    <Link
      href={`/personas/${code}`}
      className="block rounded-2xl border border-[var(--color-earth-100)] bg-[var(--color-paper)] p-5 shadow-sm hover:shadow-md transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-[var(--color-ink)]">{displayName}</h3>
          {age !== null && <p className="text-sm text-[var(--color-ink-soft)]">{age} años</p>}
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
