import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse } from "@/lib/apiError";
import { z } from "zod";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) throw Object.assign(new Error("No autenticado"), { status: 401 });

    const [estados, tiposEgreso, camposConfidenciales] = await Promise.all([
      prisma.statusOption.findMany({ orderBy: { order: "asc" } }),
      prisma.exitTypeOption.findMany({ orderBy: { order: "asc" } }),
      prisma.confidentialFieldDefinition.findMany({ orderBy: { order: "asc" } }),
    ]);

    return NextResponse.json({ estados, tiposEgreso, camposConfidenciales });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

const schema = z.object({
  tipo: z.enum(["estado", "tipoEgreso", "campoConfidencial"]),
  code: z.string().min(1),
  label: z.string().min(1),
  fieldType: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user.role !== "SUPER_ADMIN" && session?.user.role !== "ADMIN") {
      throw Object.assign(new Error("Solo administradores pueden configurar catálogos"), { status: 403 });
    }
    const data = schema.parse(await req.json());

    if (data.tipo === "estado") {
      const created = await prisma.statusOption.create({
        data: { code: data.code, label: data.label, order: 999 },
      });
      return NextResponse.json({ estado: created }, { status: 201 });
    }
    if (data.tipo === "tipoEgreso") {
      const created = await prisma.exitTypeOption.create({
        data: { code: data.code, label: data.label, order: 999 },
      });
      return NextResponse.json({ tipoEgreso: created }, { status: 201 });
    }
    const created = await prisma.confidentialFieldDefinition.create({
      data: { key: data.code, label: data.label, fieldType: data.fieldType ?? "text", order: 999 },
    });
    return NextResponse.json({ campoConfidencial: created }, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
