import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { apiErrorResponse } from "@/lib/apiError";
import { z } from "zod";

const schema = z.object({
  allowPublicProfile: z.boolean().optional(),
  allowPhoto: z.boolean().optional(),
  allowName: z.boolean().optional(),
  allowAge: z.boolean().optional(),
  allowEntryYear: z.boolean().optional(),
  allowExitYear: z.boolean().optional(),
  allowReinsertionStatus: z.boolean().optional(),
  documentRef: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  revoke: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    requirePermission(session?.user, "publish");
    const { id } = await params;
    const data = schema.parse(await req.json());
    const { revoke, ...consentFields } = data;

    const before = await prisma.personConsent.findUnique({ where: { personId: id } });

    const updated = await prisma.personConsent.upsert({
      where: { personId: id },
      create: {
        personId: id,
        ...consentFields,
        authorizedAt: new Date(),
        authorizedById: session!.user.id,
      },
      update: {
        ...consentFields,
        ...(revoke
          ? { revokedAt: new Date(), revokedById: session!.user.id, allowPublicProfile: false }
          : consentFields.allowPublicProfile === true
          ? { revokedAt: null, revokedById: null, authorizedAt: new Date(), authorizedById: session!.user.id }
          : {}),
      },
    });

    await logAudit({
      userId: session!.user.id,
      personId: id,
      action: revoke ? "REVOCAR_CONSENTIMIENTO" : "ACTUALIZAR_CONSENTIMIENTO",
      module: "CONSENTIMIENTO",
      oldValue: before ? JSON.stringify(before) : null,
      newValue: JSON.stringify(updated),
    });

    return NextResponse.json({ consentimiento: updated });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
