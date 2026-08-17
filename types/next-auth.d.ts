import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: UserRole;
    canViewConfidential: boolean;
    canPublish: boolean;
    canExport: boolean;
    canDelete: boolean;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: UserRole;
      canViewConfidential: boolean;
      canPublish: boolean;
      canExport: boolean;
      canDelete: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    canViewConfidential: boolean;
    canPublish: boolean;
    canExport: boolean;
    canDelete: boolean;
  }
}
