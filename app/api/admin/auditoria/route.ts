import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse } from "@/lib/apiError";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) throw Object.assign(new Error("No autenticado"), { status: 401 });
    if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
      throw Object.assign(new Error("No autorizado"), { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const personId = searchParams.get("personId");
    const limit = Math.min(Number(searchParams.get("limit") ?? 100), 500);

    const logs = await prisma.auditLog.findMany({
      where: personId ? { personId } : undefined,
      include: { user: { select: { name: true, email: true } }, person: { select: { internalCode: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ registros: logs });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
