import { Suspense } from "react";
import Link from "next/link";
import { PeopleTable } from "@/components/admin/PeopleTable";

export default function AdminPeoplePage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Personas</h1>
        <Link
          href="/admin/personas/nuevo"
          className="inline-flex items-center justify-center text-center rounded-full bg-[var(--color-earth-600)] text-white px-4 py-2.5 font-display tracking-wide text-base hover:bg-[var(--color-earth-800)]"
        >
          + Nueva persona
        </Link>
      </div>
      <Suspense fallback={<p className="text-sm text-[var(--color-ink-soft)]">Cargando...</p>}>
        <PeopleTable />
      </Suspense>
    </div>
  );
}
