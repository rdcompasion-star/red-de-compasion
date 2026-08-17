import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiErrorResponse(err: unknown) {
  if (err instanceof ZodError) {
    return NextResponse.json({ error: "Datos inválidos", detalles: err.issues }, { status: 400 });
  }
  const status = (err as { status?: number })?.status ?? 500;
  const message = err instanceof Error ? err.message : "Error interno";
  if (status === 500) console.error(err);
  return NextResponse.json({ error: message }, { status });
}
