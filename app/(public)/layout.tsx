import { PublicHeader } from "@/components/public/Header";
import { PublicFooter } from "@/components/public/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col min-h-screen">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/fondo.jpg"
        alt=""
        aria-hidden
        className="fixed inset-0 -z-10 h-full w-full object-cover opacity-[0.08] pointer-events-none select-none"
      />
      <PublicHeader />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-10">{children}</main>
      <PublicFooter />
    </div>
  );
}
