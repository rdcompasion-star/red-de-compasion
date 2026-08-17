import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { requirePermission } from "@/lib/permissions";
import { changePersonStatus } from "@/lib/personStatus";
import { apiErrorResponse } from "@/lib/apiError";
import { z } from "zod";

const schema = z.object({
  statusCode: z.string(),
  customLabel: z.string().optional(),
  fecha: z.string().optional(),
  observaciones: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    requirePermission(session?.user, "edit");
    const { id } = await params;
    const data = schema.parse(await req.json());

    const updated = await changePersonStatus({
      personId: id,
      statusCode: data.statusCode,
      customLabel: data.customLabel,
      fecha: data.fecha ? new Date(data.fecha) : undefined,
      observaciones: data.observaciones,
      actingUserId: session!.user.id,
    });

    return NextResponse.json({ persona: updated });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
