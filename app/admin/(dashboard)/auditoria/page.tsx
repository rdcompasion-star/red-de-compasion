import { prisma } from "@/lib/prisma";

export default async function AuditoriaPage() {
  const logs = await prisma.auditLog.findMany({
    include: { user: { select: { name: true, email: true } }, person: { select: { internalCode: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Registro de actividad</h1>
        <p className="text-sm text-[var(--color-ink-soft)] mt-1">Auditoría de cambios realizados en el sistema.</p>
      </div>

      <div className="rounded-2xl border border-[var(--color-earth-100)] bg-[var(--color-paper)] divide-y divide-[var(--color-earth-100)]">
        {logs.map((log) => (
          <div key={log.id} className="p-4 text-sm">
            <div className="flex justify-between text-xs text-[var(--color-ink-soft)]">
              <span>{new Date(log.createdAt).toLocaleString("es-CL")}</span>
              <span>{log.user?.name ?? "Sistema"}</span>
            </div>
            <p className="mt-1 text-[var(--color-ink)]">
              <span className="font-medium">{log.action}</span>
              {log.person && <span> — Persona {log.person.internalCode}</span>}
              {log.field && <span> — campo: {log.field}</span>}
            </p>
            {(log.oldValue || log.newValue) && (
              <p className="text-xs text-[var(--color-ink-soft)] mt-0.5">
                {log.oldValue ? `"${log.oldValue}" → ` : ""}
                {log.newValue ? `"${log.newValue}"` : ""}
              </p>
            )}
          </div>
        ))}
        {logs.length === 0 && <p className="p-6 text-sm text-[var(--color-ink-soft)] text-center">Sin actividad registrada aún.</p>}
      </div>
    </div>
  );
}
