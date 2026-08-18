"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { ImageModal } from "@/components/Modal";

const STATUS_OPTIONS = [
  { code: "RESIDENTE_ACTIVO", label: "Residente activo", colorHex: "#2f9e6e" },
  { code: "EGRESADO", label: "Egresado", colorHex: "#3b6ea5" },
  { code: "REINSERTADO", label: "Reinsertado", colorHex: "#7c5cbf" },
  { code: "REINSERTADO_TRABAJANDO", label: "Reinsertado + trabajando", colorHex: "#3f9142" },
  { code: "ABANDONO", label: "Abandonó el proceso", colorHex: "#8a8a8a" },
];
const EMPLOYMENT_OPTIONS = [
  ["NO_TRABAJA", "No trabaja"],
  ["BUSCA_EMPLEO", "Busca empleo"],
  ["TRABAJANDO", "Trabajando"],
  ["INDEPENDIENTE", "Trabajador independiente"],
  ["ESTUDIANDO", "Estudiando"],
  ["ESTUDIA_Y_TRABAJA", "Estudia y trabaja"],
  ["OTRA", "Otra"],
  ["NO_INFORMADO", "No informado"],
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Person = any;

function calcAgeLocal(birth: string | null) {
  if (!birth) return null;
  const b = new Date(birth);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="animate-fade-in-up rounded-2xl border border-[var(--color-earth-100)] bg-[var(--color-paper)] p-5 space-y-4">
      <h2 className="font-medium text-[var(--color-ink)] flex items-center gap-2">
        <span aria-hidden>{icon}</span> {title}
      </h2>
      {children}
    </section>
  );
}

const inputCls = "w-full rounded-lg border border-[var(--color-earth-100)] px-3 py-2 text-sm";
const btnGhost =
  "rounded-lg border border-[var(--color-earth-100)] px-4 py-2 text-sm font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-earth-50)]";
const btnCls = "rounded-lg bg-[var(--color-earth-600)] text-white px-4 py-2 text-sm font-medium hover:bg-[var(--color-earth-800)] disabled:opacity-60";
const btnBigCls =
  "w-full rounded-xl bg-[var(--color-earth-600)] text-white px-5 py-3.5 text-base font-semibold hover:bg-[var(--color-earth-800)] disabled:opacity-60 transition";
const btnGreenCls =
  "w-full rounded-xl bg-[var(--color-sage-500)] text-white px-5 py-3.5 text-base font-semibold hover:bg-[var(--color-sage-700)] disabled:opacity-60 transition";

export function PersonDetail({
  id,
  canViewConfidential,
  canPublish,
  canDelete,
}: {
  id: string;
  canViewConfidential: boolean;
  canPublish: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingMsg, setSavingMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/personas/${id}`);
    if (res.ok) {
      const data = await res.json();
      setPerson(data.persona);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const notify = (msg: string) => {
    setSavingMsg(msg);
    setTimeout(() => setSavingMsg(null), 2500);
  };

  if (loading) return <p className="text-sm text-[var(--color-ink-soft)]">Cargando ficha...</p>;
  if (!person) return <p className="text-sm text-red-700">No se encontró la persona.</p>;

  const statusInfo = STATUS_OPTIONS.find((s) => s.code === person.currentStatusCode);
  const age = calcAgeLocal(person.identity?.fechaNacimiento);

  return (
    <div className="space-y-6 max-w-3xl pb-12">
      {savingMsg && (
        <div className="fixed top-4 right-4 z-30 rounded-lg bg-[var(--color-sage-700)] text-white px-4 py-2 text-sm shadow-lg">
          ✓ {savingMsg}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1 text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-earth-600)] mb-1"
          >
            ← Volver al panel
          </Link>
          <p className="text-xs text-[var(--color-earth-600)] uppercase tracking-wide">{person.internalCode}</p>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)]">
            {person.identity?.nombres} {person.identity?.apellidos}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
            {age !== null && <span>{age} años</span>}
            {statusInfo && <StatusBadge label={statusInfo.label} colorHex={statusInfo.colorHex} />}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={async () => {
              if (!confirm("¿Archivar esta persona? Podrá recuperarse luego.")) return;
              await fetch(`/api/admin/personas/${id}`, { method: "DELETE" });
              router.push("/admin/personas");
            }}
            className="text-sm text-red-700 hover:underline"
          >
            Archivar
          </button>
          {canDelete && (
            <button
              onClick={async () => {
                if (!confirm(`¿Eliminar DEFINITIVAMENTE a ${person.internalCode}? Esto borra todos sus datos, fotos y documentos. No se puede deshacer.`))
                  return;
                if (!confirm("Confirma una vez más: esta acción es irreversible. ¿Eliminar de todas formas?")) return;
                const res = await fetch(`/api/admin/personas/${id}?hard=true`, { method: "DELETE" });
                if (res.ok) router.push("/admin/personas");
                else alert("No se pudo eliminar.");
              }}
              className="text-sm text-red-700 font-medium hover:underline"
            >
              Eliminar definitivamente
            </button>
          )}
        </div>
      </div>

      {person.consent?.allowPublicProfile && !person.consent?.revokedAt && (
        <a
          href={`/personas/${person.internalCode}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-earth-600)] hover:underline"
        >
          🌐 Ver ficha pública ↗
        </a>
      )}

      {/* ESTADO */}
      <Section title="Estado" icon="🟢">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            await fetch(`/api/admin/personas/${id}/estado`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ statusCode: form.get("statusCode"), observaciones: form.get("observaciones") }),
            });
            notify("Estado actualizado");
            load();
          }}
          className="space-y-3"
        >
          <select name="statusCode" defaultValue={person.currentStatusCode} className={inputCls}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.code} value={s.code}>
                {s.label}
              </option>
            ))}
          </select>
          <textarea name="observaciones" placeholder="Observaciones del cambio (opcional)" className={inputCls} rows={2} />
          <button type="submit" className={btnGreenCls}>
            Guardar cambios
          </button>
          <p className="text-xs text-center text-[var(--color-ink-soft)]">
            El cambio queda registrado en el historial y, si corresponde, se refleja de inmediato en el sitio público.
          </p>
        </form>

        {person.statusHistory?.length > 0 && (
          <ol className="mt-4 space-y-2 border-l border-[var(--color-earth-100)] pl-4">
            {person.statusHistory.map((h: Person) => (
              <li key={h.id} className="text-sm">
                <span className="text-xs text-[var(--color-ink-soft)]">
                  {new Date(h.fecha).toLocaleDateString("es-CL")}
                </span>{" "}
                — {STATUS_OPTIONS.find((s) => s.code === h.statusCode)?.label ?? h.statusCode}
                {h.observaciones && <p className="text-xs text-[var(--color-ink-soft)]">{h.observaciones}</p>}
              </li>
            ))}
          </ol>
        )}
      </Section>

      {/* IDENTIFICACION */}
      <Section title="Identificación (privado)" icon="🔒">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const identity = Object.fromEntries(f.entries());
            await fetch(`/api/admin/personas/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ identity }),
            });
            notify("Identificación guardada");
            load();
          }}
          className="grid sm:grid-cols-2 gap-3"
        >
          <input name="nombres" defaultValue={person.identity?.nombres ?? ""} placeholder="Nombres" className={inputCls} />
          <input name="apellidos" defaultValue={person.identity?.apellidos ?? ""} placeholder="Apellidos" className={inputCls} />
          <input
            type="date"
            name="fechaNacimiento"
            defaultValue={person.identity?.fechaNacimiento?.slice(0, 10) ?? ""}
            className={inputCls}
          />
          <input name="rut" defaultValue={person.identity?.rut ?? ""} placeholder="RUT" className={inputCls} />
          <input name="telefono" defaultValue={person.identity?.telefono ?? ""} placeholder="Teléfono" className={inputCls} />
          <input name="correo" defaultValue={person.identity?.correo ?? ""} placeholder="Correo" className={inputCls} />
          <input name="comuna" defaultValue={person.identity?.comuna ?? ""} placeholder="Comuna" className={inputCls} />
          <input name="region" defaultValue={person.identity?.region ?? ""} placeholder="Región" className={inputCls} />
          <input name="direccion" defaultValue={person.identity?.direccion ?? ""} placeholder="Dirección" className={inputCls} />
          <input
            name="contactoEmergenciaNombre"
            defaultValue={person.identity?.contactoEmergenciaNombre ?? ""}
            placeholder="Contacto de emergencia"
            className={inputCls}
          />
          <input
            name="contactoEmergenciaTelefono"
            defaultValue={person.identity?.contactoEmergenciaTelefono ?? ""}
            placeholder="Teléfono de emergencia"
            className={inputCls}
          />
          <div className="sm:col-span-2">
            <button type="submit" className={btnCls}>
              Guardar identificación
            </button>
          </div>
        </form>
      </Section>

      {/* PROCESO: ingreso / egreso */}
      <Section title="Proceso" icon="📋">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            await fetch(`/api/admin/personas/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                entryInfo: { fechaIngreso: f.get("fechaIngreso"), modalidadIngreso: f.get("modalidadIngreso") },
                exitInfo: {
                  fechaEgreso: f.get("fechaEgreso") || null,
                  exitTypeCode: f.get("exitTypeCode") || null,
                  observaciones: f.get("exitObs") || null,
                },
              }),
            });
            notify("Proceso guardado");
            load();
          }}
          className="space-y-4"
        >
          <div>
            <p className="text-xs font-medium text-[var(--color-ink-soft)] mb-2 uppercase">Ingreso</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                type="date"
                name="fechaIngreso"
                defaultValue={person.entryInfo?.fechaIngreso?.slice(0, 10) ?? ""}
                className={inputCls}
              />
              <input
                name="modalidadIngreso"
                defaultValue={person.entryInfo?.modalidadIngreso ?? ""}
                placeholder="Modalidad de ingreso"
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--color-ink-soft)] mb-2 uppercase">Egreso</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                type="date"
                name="fechaEgreso"
                defaultValue={person.exitInfo?.fechaEgreso?.slice(0, 10) ?? ""}
                className={inputCls}
              />
              <select name="exitTypeCode" defaultValue={person.exitInfo?.exitTypeCode ?? ""} className={inputCls}>
                <option value="">Tipo de egreso...</option>
                <option value="EXITOSO">Egreso exitoso</option>
                <option value="REINSERCION">Reinserción</option>
                <option value="REINSERCION_LABORAL">Reinserción laboral</option>
                <option value="ALTA">Alta</option>
                <option value="ABANDONO">Abandono</option>
                <option value="DERIVACION">Derivación</option>
                <option value="OTRO">Otro</option>
              </select>
              <textarea
                name="exitObs"
                defaultValue={person.exitInfo?.observaciones ?? ""}
                placeholder="Observaciones de egreso"
                className={`${inputCls} sm:col-span-2`}
                rows={2}
              />
            </div>
          </div>
          <button type="submit" className={btnCls}>
            Guardar proceso
          </button>
        </form>
      </Section>

      {/* AUTORIZACIONES */}
      <Section title="Autorización de publicación 🌎" icon="✅">
        <ConsentForm personId={id} consent={person.consent} publicSettings={person.publicSettings} canPublish={canPublish} onSaved={() => { notify("Autorizaciones guardadas"); load(); }} />
      </Section>

      {/* FOTOGRAFIAS */}
      <Section title="Fotografías" icon="📷">
        <PhotosPanel
          personId={id}
          photos={person.photos ?? []}
          canPublish={canPublish}
          currentStatusCode={person.currentStatusCode}
          onChange={() => load()}
          notify={notify}
        />
      </Section>

      {/* DOCUMENTOS */}
      <Section title="Documentos (100% privado)" icon="📁">
        <DocumentsPanel personId={id} documents={person.documents ?? []} onChange={() => load()} notify={notify} />
      </Section>

      {/* SEGUIMIENTO */}
      <Section title="Seguimiento post-egreso" icon="🧭">
        <FollowUpPanel personId={id} followUps={person.followUps ?? []} onChange={() => load()} notify={notify} />
      </Section>

      {/* CONFIDENCIAL */}
      {canViewConfidential && (
        <Section title="Información confidencial 🔐" icon="🔐">
          <ConfidentialPanel personId={id} notify={notify} />
        </Section>
      )}

      {/* NOTAS INTERNAS */}
      <Section title="Notas internas" icon="📝">
        <NotesPanel personId={id} notes={person.internalNotes ?? []} onChange={() => load()} notify={notify} />
      </Section>
    </div>
  );
}

// ---- subcomponentes ----

function ConsentForm({
  personId,
  consent,
  publicSettings,
  canPublish,
  onSaved,
}: {
  personId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  consent: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  publicSettings: any;
  canPublish: boolean;
  onSaved: () => void;
}) {
  const fields: [string, string][] = [
    ["allowPublicProfile", "¿Autoriza aparecer públicamente?"],
    ["allowPhoto", "¿Autoriza mostrar fotografía?"],
    ["allowName", "¿Autoriza mostrar nombre?"],
    ["allowAge", "¿Autoriza mostrar edad?"],
    ["allowEntryYear", "¿Autoriza mostrar año de ingreso?"],
    ["allowExitYear", "¿Autoriza mostrar año de egreso?"],
    ["allowReinsertionStatus", "¿Autoriza mostrar estado de reinserción?"],
  ];

  if (!canPublish) {
    return <p className="text-sm text-[var(--color-ink-soft)]">No tienes permiso para modificar autorizaciones de publicación.</p>;
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const body: Record<string, unknown> = {};
        for (const [key] of fields) body[key] = f.get(key) === "on";
        body.nameVisibility = f.get("nameVisibility");
        await fetch(`/api/admin/personas/${personId}/consentimiento`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        await fetch(`/api/admin/personas/${personId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicSettings: { nameVisibility: f.get("nameVisibility") } }),
        });
        onSaved();
      }}
      className="space-y-3"
    >
      {fields.map(([key, label]) => (
        <label key={key} className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
          <input type="checkbox" name={key} defaultChecked={!!consent?.[key]} className="rounded" />
          {label}
        </label>
      ))}
      <div>
        <label className="block text-xs text-[var(--color-ink-soft)] mb-1">Visibilidad del nombre</label>
        <select name="nameVisibility" defaultValue={publicSettings?.nameVisibility ?? "CODE"} className={inputCls}>
          <option value="FULL">Nombre completo</option>
          <option value="FIRST_NAME">Primer nombre</option>
          <option value="INITIALS">Iniciales</option>
          <option value="CODE">Código anónimo</option>
        </select>
      </div>
      {consent?.revokedAt && (
        <p className="text-xs text-red-700">Autorización revocada el {new Date(consent.revokedAt).toLocaleDateString("es-CL")}</p>
      )}
      <button type="submit" className={btnBigCls}>
        Guardar y publicar autorizaciones
      </button>
      <p className="text-xs text-center text-[var(--color-ink-soft)]">
        Al guardar, el sitio público se actualiza de inmediato según lo marcado arriba.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={async () => {
            if (!confirm("¿Revocar la autorización de publicación? La información dejará de mostrarse públicamente de inmediato.")) return;
            await fetch(`/api/admin/personas/${personId}/consentimiento`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ revoke: true }),
            });
            onSaved();
          }}
          className="rounded-lg border border-red-300 text-red-700 px-4 py-2 text-sm font-medium hover:bg-red-50"
        >
          Revocar autorización
        </button>
      </div>
    </form>
  );
}

const COMPLETION_STATUSES = ["EGRESADO", "REINSERTADO", "REINSERTADO_TRABAJANDO"];

function PhotosPanel({
  personId,
  photos,
  canPublish,
  currentStatusCode,
  onChange,
  notify,
}: {
  personId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  photos: any[];
  canPublish: boolean;
  currentStatusCode: string;
  onChange: () => void;
  notify: (m: string) => void;
}) {
  const hasEgreso = photos.some((p) => p.tipo === "EGRESO");
  const showEgresoPrompt = COMPLETION_STATUSES.includes(currentStatusCode) && !hasEgreso;

  return (
    <div className="space-y-4">
      {showEgresoPrompt && (
        <div className="rounded-xl border border-[var(--color-sage-500)] bg-[var(--color-sage-100)] p-4">
          <p className="text-sm font-medium text-[var(--color-sage-700)]">
            Esta persona completó su proceso — ¿agregamos su fotografía de egreso?
          </p>
          <p className="text-xs text-[var(--color-ink-soft)] mt-1">
            Permite mostrar la evolución (antes/después) cuando exista autorización de publicación.
          </p>
        </div>
      )}

      <PhotoUploadForm
        personId={personId}
        defaultTipo={showEgresoPrompt ? "EGRESO" : "INGRESO"}
        onChange={onChange}
        notify={notify}
      />

      {photos.length === 0 ? (
        <p className="text-sm text-[var(--color-ink-soft)]">Aún no hay fotografías.</p>
      ) : (
        <div className="space-y-5">
          {[
            ["INGRESO", "Ingreso"],
            ["EGRESO", "Egreso"],
            ["EVOLUCION", "Evolución"],
          ].map(([tipo, label]) => {
            const group = photos.filter((ph) => ph.tipo === tipo);
            if (group.length === 0) return null;
            return (
              <div key={tipo}>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-soft)] mb-2">{label}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {group.map((ph) => (
                    <PhotoCard key={ph.id} photo={ph} canPublish={canPublish} notify={notify} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PhotoCard({
  photo,
  canPublish,
  notify,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  photo: any;
  canPublish: boolean;
  notify: (m: string) => void;
}) {
  const [zoomed, setZoomed] = useState(false);
  return (
    <div className="rounded-xl border border-[var(--color-earth-100)] overflow-hidden">
      {zoomed && (
        <ImageModal src={`/api/admin/files/fotos/${photo.id}`} alt={photo.tipo} onClose={() => setZoomed(false)} />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/admin/files/fotos/${photo.id}`}
        alt={photo.tipo}
        onClick={() => setZoomed(true)}
        className="w-full aspect-square object-cover cursor-zoom-in"
      />
      {canPublish && (
        <label className="flex items-center gap-1.5 text-xs p-2">
          <input
            type="checkbox"
            defaultChecked={photo.publicAuthorized}
            onChange={async (e) => {
              await fetch(`/api/admin/fotos/${photo.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ publicAuthorized: e.target.checked }),
              });
              notify("Visibilidad actualizada");
            }}
          />
          Pública
        </label>
      )}
    </div>
  );
}

function PhotoUploadForm({
  personId,
  defaultTipo,
  onChange,
  notify,
}: {
  personId: string;
  defaultTipo: "INGRESO" | "EGRESO";
  onChange: () => void;
  notify: (m: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [tipo, setTipo] = useState(defaultTipo);
  const [descripcion, setDescripcion] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    const f = new FormData();
    f.append("file", file);
    f.append("tipo", tipo);
    if (descripcion) f.append("descripcion", descripcion);
    const res = await fetch(`/api/admin/personas/${personId}/fotos`, { method: "POST", body: f });
    setUploading(false);
    if (res.ok) {
      notify("Fotografía subida");
      setFile(null);
      setDescripcion("");
      onChange();
    } else {
      const err = await res.json();
      alert(err.error ?? "Error al subir");
    }
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <select value={tipo} onChange={(e) => setTipo(e.target.value as "INGRESO" | "EGRESO")} className={inputCls + " w-auto"}>
        <option value="INGRESO">Foto de ingreso</option>
        <option value="EGRESO">Foto de egreso</option>
        <option value="EVOLUCION">Evolución</option>
      </select>
      <label className={btnGhost + " cursor-pointer"}>
        {file ? file.name : "Elegir fotografía"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
        />
      </label>
      <input
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        placeholder="Descripción"
        className={inputCls + " w-auto"}
      />
      <button type="button" disabled={!file || uploading} onClick={handleUpload} className={btnCls}>
        {uploading ? "Subiendo..." : "Subir fotografía"}
      </button>
    </div>
  );
}

function DocumentsPanel({
  personId,
  documents,
  onChange,
  notify,
}: {
  personId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  documents: any[];
  onChange: () => void;
  notify: (m: string) => void;
}) {
  return (
    <div className="space-y-4">
      <DocumentUploadForm personId={personId} onChange={onChange} notify={notify} />

      <ul className="divide-y divide-[var(--color-earth-100)]">
        {documents.map((d) => (
          <li key={d.id} className="py-2 flex items-center justify-between text-sm">
            <div>
              <p className="text-[var(--color-ink)]">{d.tipo}</p>
              <p className="text-xs text-[var(--color-ink-soft)]">{d.nombreArchivo}</p>
            </div>
            <a href={`/api/admin/files/documentos/${d.id}`} target="_blank" rel="noreferrer" className="text-[var(--color-earth-600)] hover:underline">
              Ver
            </a>
          </li>
        ))}
        {documents.length === 0 && <p className="text-sm text-[var(--color-ink-soft)] py-2">Sin documentos.</p>}
      </ul>
    </div>
  );
}

function DocumentUploadForm({
  personId,
  onChange,
  notify,
}: {
  personId: string;
  onChange: () => void;
  notify: (m: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [tipo, setTipo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!file || !tipo) return;
    setUploading(true);
    const f = new FormData();
    f.append("file", file);
    f.append("tipo", tipo);
    if (descripcion) f.append("descripcion", descripcion);
    const res = await fetch(`/api/admin/personas/${personId}/documentos`, { method: "POST", body: f });
    setUploading(false);
    if (res.ok) {
      notify("Documento subido");
      setFile(null);
      setTipo("");
      setDescripcion("");
      onChange();
    } else {
      const err = await res.json();
      alert(err.error ?? "Error al subir");
    }
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <input
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        placeholder="Tipo (ej. Ficha de ingreso)"
        className={inputCls + " w-auto"}
      />
      <label className={btnGhost + " cursor-pointer"}>
        {file ? file.name : "Elegir documento"}
        <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
      </label>
      <input
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        placeholder="Descripción"
        className={inputCls + " w-auto"}
      />
      <button type="button" disabled={!file || !tipo || uploading} onClick={handleUpload} className={btnCls}>
        {uploading ? "Subiendo..." : "Subir documento"}
      </button>
    </div>
  );
}

function FollowUpPanel({
  personId,
  followUps,
  onChange,
  notify,
}: {
  personId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  followUps: any[];
  onChange: () => void;
  notify: (m: string) => void;
}) {
  return (
    <div className="space-y-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const f = new FormData(form);
          const body = Object.fromEntries(f.entries());
          await fetch(`/api/admin/personas/${personId}/seguimiento`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          notify("Seguimiento registrado");
          form.reset();
          onChange();
        }}
        className="grid sm:grid-cols-2 gap-3"
      >
        <input type="date" name="fecha" className={inputCls} />
        <select name="empleo" className={inputCls}>
          <option value="">Situación laboral...</option>
          {EMPLOYMENT_OPTIONS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <input name="vivienda" placeholder="Vivienda" className={inputCls} />
        <input name="estudios" placeholder="Estudios" className={inputCls} />
        <input name="redApoyo" placeholder="Red de apoyo" className={inputCls} />
        <input type="date" name="proximaRevision" placeholder="Próxima revisión" className={inputCls} />
        <textarea name="observaciones" placeholder="Observaciones" className={`${inputCls} sm:col-span-2`} rows={2} />
        <div className="sm:col-span-2">
          <button type="submit" className={btnCls}>
            Registrar seguimiento
          </button>
        </div>
      </form>

      <ul className="space-y-2">
        {followUps.map((fu) => (
          <li key={fu.id} className="text-sm border-t border-[var(--color-earth-100)] pt-2">
            <span className="text-xs text-[var(--color-ink-soft)]">{new Date(fu.fecha).toLocaleDateString("es-CL")}</span>
            {fu.empleo && <span> — {EMPLOYMENT_OPTIONS.find(([v]) => v === fu.empleo)?.[1]}</span>}
            {fu.observaciones && <p className="text-xs text-[var(--color-ink-soft)]">{fu.observaciones}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function NotesPanel({
  personId,
  notes,
  onChange,
  notify,
}: {
  personId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notes: any[];
  onChange: () => void;
  notify: (m: string) => void;
}) {
  return (
    <div className="space-y-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const f = new FormData(form);
          await fetch(`/api/admin/personas/${personId}/notas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contenido: f.get("contenido") }),
          });
          notify("Nota agregada");
          form.reset();
          onChange();
        }}
        className="space-y-2"
      >
        <textarea name="contenido" required placeholder="Escribir nota interna..." className={inputCls} rows={2} />
        <button type="submit" className={btnCls}>
          Agregar nota
        </button>
      </form>

      <ul className="space-y-3">
        {notes.map((n) => (
          <li key={n.id} className="text-sm border-t border-[var(--color-earth-100)] pt-2">
            <p className="text-xs text-[var(--color-ink-soft)]">{new Date(n.fecha).toLocaleString("es-CL")}</p>
            <p className="text-[var(--color-ink)]">{n.contenido}</p>
          </li>
        ))}
        {notes.length === 0 && <p className="text-sm text-[var(--color-ink-soft)]">Sin notas.</p>}
      </ul>
    </div>
  );
}

function ConfidentialPanel({ personId, notify }: { personId: string; notify: (m: string) => void }) {
  const [data, setData] = useState<{ definiciones: Person[]; valores: Person[] } | null>(null);

  useEffect(() => {
    fetch(`/api/admin/personas/${personId}/confidencial`)
      .then((r) => r.json())
      .then(setData);
  }, [personId]);

  if (!data) return <p className="text-sm text-[var(--color-ink-soft)]">Cargando...</p>;

  if (data.definiciones.length === 0) {
    return (
      <p className="text-sm text-[var(--color-ink-soft)]">
        No hay campos confidenciales configurados aún. Un administrador puede definirlos según los protocolos del centro.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {data.definiciones.map((def: Person) => {
        const current = data.valores.find((v: Person) => v.fieldKey === def.key)?.valor ?? "";
        return (
          <form
            key={def.key}
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              await fetch(`/api/admin/personas/${personId}/confidencial`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fieldKey: def.key, valor: f.get("valor") }),
              });
              notify(`${def.label} guardado`);
            }}
            className="flex gap-2 items-end"
          >
            <div className="flex-1">
              <label className="block text-xs text-[var(--color-ink-soft)] mb-1">{def.label}</label>
              <textarea name="valor" defaultValue={current} className={inputCls} rows={1} />
            </div>
            <button type="submit" className={btnCls}>
              Guardar
            </button>
          </form>
        );
      })}
    </div>
  );
}
