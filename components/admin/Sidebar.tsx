"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const ITEMS = [
  { href: "/admin/dashboard", label: "Panel", icon: "📊" },
  { href: "/admin/personas", label: "Personas", icon: "🧑‍🤝‍🧑" },
  { href: "/admin/auditoria", label: "Auditoría", icon: "🕓", roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/", label: "Sitio público", icon: "🌐", external: true },
];

export function AdminSidebar({ userName, userRole }: { userName: string; userRole: string }) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden md:flex md:flex-col w-60 shrink-0 border-r border-[var(--color-earth-100)] bg-[var(--color-paper)] min-h-screen">
        <div className="p-5 border-b border-[var(--color-earth-100)] flex items-center gap-2">
          <Image src="/logo.jpg" alt="" width={28} height={28} className="rounded-full object-cover" />
          <div>
            <p className="font-display tracking-wide text-lg text-[var(--color-earth-800)] leading-none">Red de Compasión</p>
            <p className="text-xs text-[var(--color-ink-soft)] mt-1">Panel privado</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {ITEMS.filter((i) => !i.roles || i.roles.includes(userRole)).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noreferrer" : undefined}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm ${
                !item.external && pathname.startsWith(item.href)
                  ? "bg-[var(--color-earth-50)] text-[var(--color-earth-800)] font-medium"
                  : "text-[var(--color-ink-soft)] hover:bg-[var(--color-earth-50)]"
              }`}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
              {item.external && <span aria-hidden className="ml-auto text-xs">↗</span>}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[var(--color-earth-100)] text-sm">
          <p className="font-medium text-[var(--color-ink)]">{userName}</p>
          <p className="text-xs text-[var(--color-ink-soft)]">{userRole}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="mt-2 text-xs text-[var(--color-earth-600)] hover:underline"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-[var(--color-paper)] border-t border-[var(--color-earth-100)] flex justify-around py-2">
        {ITEMS.filter((i) => !i.roles || i.roles.includes(userRole)).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noreferrer" : undefined}
            className={`flex flex-col items-center text-[10px] px-2 py-1 rounded-lg ${
              !item.external && pathname.startsWith(item.href) ? "text-[var(--color-earth-800)]" : "text-[var(--color-ink-soft)]"
            }`}
          >
            <span className="text-lg" aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
