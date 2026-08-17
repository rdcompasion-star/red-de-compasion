import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-[var(--color-cream)]">
      <AdminSidebar userName={session.user.name ?? session.user.email ?? ""} userRole={session.user.role} />
      <main className="flex-1 p-4 sm:p-8 pb-20 md:pb-8">{children}</main>
    </div>
  );
}
