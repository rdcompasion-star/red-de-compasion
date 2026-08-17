"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputCls = "w-full rounded-lg border border-[var(--color-earth-100)] px-3 py-2.5 text-sm";
const btnCls = "rounded-lg bg-[var(--color-earth-600)] text-white px-5 py-2.5 text-sm font-medium hover:bg-[var(--color-earth-800)] disabled:opacity-60";
const btnGhost = "rounded-lg border border-[var(--color-earth-100)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-earth-50)]";

const STEPS = ["Identificación", "Ingreso", "Fotografía", "Autorizaciones", "Revisión"];

export default function NewPersonPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [personId, setPersonId] = useState<string | null>(null);
  const [internalCode, setInternalCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [identity, setIdentity] = useState({ nombres: "", apellidos: "", fechaNacimiento: "", rut: "" });
  const [entry, setEntry] = useState({ fechaIngreso: "", modalidadIngreso: "" });
  const [consent, setConsent] = useState({
    allowPublicProfile: false,
    allowPhoto: false,
    allowName: false,
    allowAge: false,
    allowEntryYear: false,
    allowExitYear: false,
    allowReinsertionStatus: false,
    nameVisibility: "CODE",
  });

  async function handleCreate() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...identity, ...entry }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Error al crear la persona");
      }
      const data = await res.json();
      setPersonId(data.persona.id);
      setInternalCode(data.persona.internalCode);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(file: File) {
    if (!personId) return;
    const form = new FormData();
    form.append("file", file);
    form.append("tipo", "INGRESO");
    await fetch(`/api/admin/personas/${personId}/fotos`, { method: "POST", body: form });
  }

  async function handleSaveConsent() {
    if (!personId) return;
    setSaving(true);
    await fetch(`/api/admin/personas/${personId}/consentimiento`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(consent),
    });
    await fetch(`/api/admin/personas/${personId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicSettings: { nameVisibility: consent.nameVisibility } }),
    });
    setSaving(false);
    setStep(4);
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Nueva persona</h1>
        <p className="text-sm text-[var(--color-ink-soft)] mt-1">Paso {step + 1} de {STEPS.length}: {STEPS[step]}</p>
      </div>

      <div className="flex gap-1.5">
        {STEPS.map((s, i) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-[var(--color-earth-600)]" : "bg-[var(--color-earth-100)]"}`} />
        ))}
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {step === 0 && (
        <div className="space-y-3">
          <input
            required
            placeholder="Nombres"
            className={inputCls}
            value={identity.nombres}
            onChange={(e) => setIdentity({ ...identity, nombres: e.target.value })}
          />
          <input
            required
            placeholder="Apellidos"
            className={inputCls}
            value={identity.apellidos}
            onChange={(e) => setIdentity({ ...identity, apellidos: e.target.value })}
          />
          <input
            type="date"
            placeholder="Fecha de nacimiento"
            className={inputCls}
            value={identity.fechaNacimiento}
            onChange={(e) => setIdentity({ ...identity, fechaNacimiento: e.target.value })}
          />
          <input
            placeholder="RUT (opcional)"
            className={inputCls}
            value={identity.rut}
            onChange={(e) => setIdentity({ ...identity, rut: e.target.value })}
          />
          <div className="flex justify-end">
            <button
              className={btnCls}
              disabled={!identity.nombres || !identity.apellidos}
              onClick={() => setStep(1)}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <input
            type="date"
            required
            className={inputCls}
            value={entry.fechaIngreso}
            onChange={(e) => setEntry({ ...entry, fechaIngreso: e.target.value })}
          />
          <input
            placeholder="Modalidad de ingreso"
            className={inputCls}
            value={entry.modalidadIngreso}
            onChange={(e) => setEntry({ ...entry, modalidadIngreso: e.target.value })}
          />
          <div className="flex justify-between">
            <button className={btnGhost} onClick={() => setStep(0)}>
              Atrás
            </button>
            <button className={btnCls} disabled={!entry.fechaIngreso || saving} onClick={handleCreate}>
              {saving ? "Guardando..." : "Guardar y continuar"}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm text-[var(--color-ink-soft)]">
            Persona creada con código <strong>{internalCode}</strong>. Puedes subir una fotografía de ingreso ahora o
            hacerlo después desde su ficha.
          </p>
          <input
            type="file"
            accept="image/*"
            className="text-sm"
            onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
          />
          <div className="flex justify-between">
            <button className={btnGhost} onClick={() => setStep(3)}>
              Omitir
            </button>
            <button className={btnCls} onClick={() => setStep(3)}>
              Siguiente
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          {[
            ["allowPublicProfile", "¿Autoriza aparecer públicamente?"],
            ["allowPhoto", "¿Autoriza mostrar fotografía?"],
            ["allowName", "¿Autoriza mostrar nombre?"],
            ["allowAge", "¿Autoriza mostrar edad?"],
            ["allowEntryYear", "¿Autoriza mostrar año de ingreso?"],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={(consent as Record<string, boolean | string>)[key] as boolean}
                onChange={(e) => setConsent({ ...consent, [key]: e.target.checked })}
              />
              {label}
            </label>
          ))}
          <select
            className={inputCls}
            value={consent.nameVisibility}
            onChange={(e) => setConsent({ ...consent, nameVisibility: e.target.value })}
          >
            <option value="CODE">Código anónimo</option>
            <option value="INITIALS">Iniciales</option>
            <option value="FIRST_NAME">Primer nombre</option>
            <option value="FULL">Nombre completo</option>
          </select>
          <div className="flex justify-between">
            <button className={btnGhost} onClick={() => setStep(2)}>
              Atrás
            </button>
            <button className={btnCls} disabled={saving} onClick={handleSaveConsent}>
              {saving ? "Guardando..." : "Guardar autorizaciones"}
            </button>
          </div>
        </div>
      )}

      {step === 4 && personId && (
        <div className="space-y-4 text-center py-8">
          <p className="text-3xl">✓</p>
          <p className="text-[var(--color-ink)]">Persona {internalCode} registrada correctamente.</p>
          <p className="text-sm text-[var(--color-ink-soft)]">
            Puedes completar el resto de su información (proceso, seguimiento, documentos, confidencial) desde su ficha.
          </p>
          <button className={btnCls} onClick={() => router.push(`/admin/personas/${personId}`)}>
            Ir a la ficha completa
          </button>
        </div>
      )}
    </div>
  );
}
