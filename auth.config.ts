import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";

/**
 * Configuracion base, compatible con Edge Runtime: sin Prisma ni bcrypt.
 * El middleware usa esto para verificar la sesion sin arrastrar dependencias
 * pesadas al Edge Function. La configuracion completa (con el provider de
 * credenciales) esta en auth.ts y solo corre en rutas Node.js.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.canViewConfidential = user.canViewConfidential;
        token.canPublish = user.canPublish;
        token.canExport = user.canExport;
        token.canDelete = user.canDelete;
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.canViewConfidential = token.canViewConfidential as boolean;
        session.user.canPublish = token.canPublish as boolean;
        session.user.canExport = token.canExport as boolean;
        session.user.canDelete = token.canDelete as boolean;
      }
      return session;
    },
  },
};
