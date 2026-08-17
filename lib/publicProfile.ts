import { calcAge, resolvePublicDisplayName } from "@/lib/domain";
import type { Person, PersonIdentity, PersonPublicSettings, PersonConsent, PersonEntry, PersonExit } from "@prisma/client";

export type PersonWithPublicRelations = Person & {
  identity: PersonIdentity | null;
  publicSettings: PersonPublicSettings | null;
  consent: PersonConsent | null;
  entryInfo: PersonEntry | null;
  exitInfo: PersonExit | null;
};

export type StatusInfo = { label: string; colorHex: string };

/**
 * Construye el perfil publico de una persona respetando, campo por campo,
 * el consentimiento vigente. Si no hay autorizacion general o fue revocada,
 * retorna null: la persona no debe aparecer en el portal publico.
 */
export function buildPublicProfile(
  p: PersonWithPublicRelations,
  statusMap: Record<string, StatusInfo>
) {
  const consent = p.consent;
  if (!consent || !consent.allowPublicProfile || consent.revokedAt) return null;

  const identity = p.identity;
  const pub = p.publicSettings;

  const displayName = resolvePublicDisplayName({
    nombres: identity?.nombres ?? "",
    apellidos: identity?.apellidos ?? "",
    internalCode: p.internalCode,
    nameVisibility: pub?.nameVisibility ?? "CODE",
    allowName: consent.allowName,
    override: pub?.publicDisplayNameOverride,
  });

  const status = statusMap[p.currentStatusCode];

  return {
    code: p.internalCode,
    displayName,
    age: consent.allowAge ? calcAge(identity?.fechaNacimiento) : null,
    entryYear: consent.allowEntryYear ? p.entryInfo?.fechaIngreso?.getFullYear() ?? null : null,
    exitYear: consent.allowExitYear ? p.exitInfo?.fechaEgreso?.getFullYear() ?? null : null,
    status: consent.allowReinsertionStatus && status ? status : null,
    hasPhoto: consent.allowPhoto,
  };
}

export type PublicPerson = NonNullable<ReturnType<typeof buildPublicProfile>>;

/** Agrupa y, si una combinacion de filtros arroja un grupo muy pequeno, lo funde en "otros" para evitar identificacion indirecta. */
export function suppressSmallGroups<T extends { key: string; count: number }>(
  groups: T[],
  minSize = 3
): T[] {
  const big = groups.filter((g) => g.count >= minSize || g.count === 0);
  const small = groups.filter((g) => g.count > 0 && g.count < minSize);
  if (small.length === 0) return big;
  const otrosCount = small.reduce((sum, g) => sum + g.count, 0);
  return [...big, { key: "OTROS", count: otrosCount } as T];
}
