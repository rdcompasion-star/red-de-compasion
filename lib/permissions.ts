import type { User } from "@prisma/client";

export type SessionUser = Pick<
  User,
  "id" | "role" | "canViewConfidential" | "canPublish" | "canExport" | "canDelete"
>;

export type PersonAction =
  | "view"
  | "create"
  | "edit"
  | "archive"
  | "delete"
  | "export"
  | "publish"
  | "viewConfidential"
  | "editConfidential";

const ROLE_BASE: Record<User["role"], PersonAction[]> = {
  SUPER_ADMIN: [
    "view",
    "create",
    "edit",
    "archive",
    "delete",
    "export",
    "publish",
    "viewConfidential",
    "editConfidential",
  ],
  ADMIN: ["view", "create", "edit", "archive", "export", "publish"],
  STAFF: ["view", "create", "edit"],
  VIEWER: ["view"],
};

/** Autorizacion combinada: rol base + permisos finos otorgados al usuario. */
export function can(user: SessionUser | null | undefined, action: PersonAction): boolean {
  if (!user) return false;
  if (ROLE_BASE[user.role]?.includes(action)) return true;
  if (action === "viewConfidential" || action === "editConfidential") {
    return user.canViewConfidential && (action === "viewConfidential" || user.role !== "VIEWER");
  }
  if (action === "publish") return user.canPublish;
  if (action === "export") return user.canExport;
  if (action === "delete") return user.canDelete;
  return false;
}

export function requirePermission(user: SessionUser | null | undefined, action: PersonAction) {
  if (!can(user, action)) {
    const err = new Error("No autorizado para esta accion");
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
}
