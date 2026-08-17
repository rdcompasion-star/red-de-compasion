import { prisma } from "@/lib/prisma";

export async function logAudit(params: {
  userId?: string | null;
  personId?: string | null;
  action: string;
  module: string;
  field?: string;
  oldValue?: string | null;
  newValue?: string | null;
  result?: string;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId ?? null,
      personId: params.personId ?? null,
      action: params.action,
      module: params.module,
      field: params.field,
      oldValue: params.oldValue ?? null,
      newValue: params.newValue ?? null,
      result: params.result ?? "success",
    },
  });
}
