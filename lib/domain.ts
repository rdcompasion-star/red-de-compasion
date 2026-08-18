/** Calculo de edad y duracion de proceso: nunca se guardan como valores fijos. */

/** Formatea una fecha como "18 ago 2026" para mostrar en el sitio publico. */
export function formatDatePublic(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  return new Date(date).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

export function calcAge(birthDate: Date | string | null | undefined, at: Date = new Date()): number | null {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  let age = at.getFullYear() - b.getFullYear();
  const m = at.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && at.getDate() < b.getDate())) age--;
  return age;
}

export function calcDuration(start: Date | string, end: Date | string | null | undefined): string {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();

  let months =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
  if (endDate.getDate() < startDate.getDate()) months--;
  if (months < 0) months = 0;

  const years = Math.floor(months / 12);
  const remMonths = months % 12;

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "año" : "años"}`);
  if (remMonths > 0 || years === 0) parts.push(`${remMonths} ${remMonths === 1 ? "mes" : "meses"}`);
  return parts.join(", ");
}

export const DEFAULT_STATUS_OPTIONS = [
  { code: "RESIDENTE_ACTIVO", label: "Residente activo", colorHex: "#2f9e6e", isSystem: true, order: 1 },
  { code: "EGRESADO", label: "Egresado", colorHex: "#3b6ea5", isSystem: true, order: 2 },
  { code: "REINSERTADO", label: "Reinsertado", colorHex: "#7c5cbf", isSystem: true, order: 3, active: false },
  {
    code: "REINSERTADO_TRABAJANDO",
    label: "Reinsertado + trabajando",
    colorHex: "#3f9142",
    isSystem: true,
    order: 4,
  },
  { code: "ABANDONO", label: "Abandonó el proceso", colorHex: "#8a8a8a", isSystem: true, order: 5 },
];

export const DEFAULT_EXIT_TYPES = [
  { code: "EXITOSO", label: "Egreso exitoso", isSystem: true, order: 1 },
  { code: "REINSERCION", label: "Reinserción", isSystem: true, order: 2 },
  { code: "REINSERCION_LABORAL", label: "Reinserción laboral", isSystem: true, order: 3 },
  { code: "ALTA", label: "Alta", isSystem: true, order: 4 },
  { code: "ABANDONO", label: "Abandono", isSystem: true, order: 5 },
  { code: "DERIVACION", label: "Derivación", isSystem: true, order: 6 },
  { code: "OTRO", label: "Otro", isSystem: true, order: 7 },
];

export const EMPLOYMENT_LABELS: Record<string, string> = {
  NO_TRABAJA: "No trabaja",
  BUSCA_EMPLEO: "Busca empleo",
  TRABAJANDO: "Trabajando",
  INDEPENDIENTE: "Trabajador independiente",
  ESTUDIANDO: "Estudiando",
  ESTUDIA_Y_TRABAJA: "Estudia y trabaja",
  OTRA: "Otra",
  NO_INFORMADO: "No informado",
};

export const NAME_VISIBILITY_LABELS: Record<string, string> = {
  FULL: "Nombre completo",
  FIRST_NAME: "Primer nombre",
  INITIALS: "Iniciales",
  CODE: "Código anónimo",
};

/** Resuelve el nombre publico segun la visibilidad configurada y el consentimiento. */
export function resolvePublicDisplayName(params: {
  nombres: string;
  apellidos: string;
  internalCode: string;
  nameVisibility: string;
  allowName: boolean;
  override?: string | null;
}): string {
  const { nombres, apellidos, internalCode, nameVisibility, allowName, override } = params;
  if (override) return override;
  if (!allowName) return `Persona ${internalCode}`;

  switch (nameVisibility) {
    case "FULL":
      return `${nombres} ${apellidos}`.trim();
    case "FIRST_NAME":
      return nombres.split(" ")[0];
    case "INITIALS":
      return `${nombres[0] ?? ""}${apellidos[0] ?? ""}`.toUpperCase();
    case "CODE":
    default:
      return `Persona ${internalCode}`;
  }
}
