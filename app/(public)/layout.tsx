import { PublicHeader } from "@/components/public/Header";
import { PublicFooter } from "@/components/public/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-10">{children}</main>
      <PublicFooter />
    </div>
  );
}
