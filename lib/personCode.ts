import { prisma } from "@/lib/prisma";

/**
 * Genera el siguiente codigo interno (P-0001, P-0002, ...) basado en el
 * numero mas alto existente, no en un conteo total. Esto evita colisiones
 * cuando una persona fue eliminada definitivamente (lo que reduciria un
 * conteo simple y generaria un codigo ya usado).
 */
export async function generateNextInternalCode(): Promise<string> {
  const last = await prisma.person.findFirst({
    orderBy: { internalCode: "desc" },
    select: { internalCode: true },
  });

  let nextNum = 1;
  const match = last?.internalCode.match(/(\d+)$/);
  if (match) nextNum = parseInt(match[1], 10) + 1;

  return `P-${String(nextNum).padStart(4, "0")}`;
}
