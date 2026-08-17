"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    router.push(searchParams.get("callbackUrl") || "/admin/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Correo</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-[var(--color-earth-100)] px-3 py-2.5 text-sm"
          placeholder="tucorreo@reddecompasion.org"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Contraseña</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-[var(--color-earth-100)] px-3 py-2.5 text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[var(--color-earth-600)] text-white py-2.5 text-sm font-medium hover:bg-[var(--color-earth-800)] disabled:opacity-60"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-cream)] px-4">
      <div className="mb-8 text-center">
        <span className="text-2xl" aria-hidden>
          🌿
        </span>
        <h1 className="text-lg font-semibold text-[var(--color-earth-800)] mt-2">Red de Compasión</h1>
        <p className="text-sm text-[var(--color-ink-soft)]">Panel privado del equipo</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
