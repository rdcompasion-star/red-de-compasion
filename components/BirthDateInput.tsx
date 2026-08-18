"use client";

const inputCls = "rounded-lg border border-[var(--color-earth-100)] px-3 py-2.5 text-sm bg-[var(--color-paper)]";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

/**
 * Selector de fecha por dia/mes/anio separados: mucho mas usable en celular
 * que el input[type=date] nativo para fechas de nacimiento lejanas (evita
 * tener que desplazar el picker anio por anio).
 */
export function BirthDateInput({
  value,
  onChange,
  name,
}: {
  value: string; // "yyyy-mm-dd" o ""
  onChange: (value: string) => void;
  name?: string;
}) {
  const [y, m, d] = value ? value.split("-") : ["", "", ""];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  function update(part: "y" | "m" | "d", newVal: string) {
    const next = {
      y: part === "y" ? newVal : y,
      m: part === "m" ? newVal : m,
      d: part === "d" ? newVal : d,
    };
    if (next.y && next.m && next.d) {
      onChange(`${next.y}-${next.m.padStart(2, "0")}-${next.d.padStart(2, "0")}`);
    } else {
      onChange("");
    }
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <select
        aria-label="Día de nacimiento"
        value={d}
        onChange={(e) => update("d", e.target.value)}
        className={inputCls}
      >
        <option value="">Día</option>
        {days.map((day) => (
          <option key={day} value={day}>
            {day}
          </option>
        ))}
      </select>
      <select
        aria-label="Mes de nacimiento"
        value={m}
        onChange={(e) => update("m", e.target.value)}
        className={inputCls}
      >
        <option value="">Mes</option>
        {MONTHS.map((month, i) => (
          <option key={month} value={i + 1}>
            {month}
          </option>
        ))}
      </select>
      <select
        aria-label="Año de nacimiento"
        value={y}
        onChange={(e) => update("y", e.target.value)}
        className={inputCls}
      >
        <option value="">Año</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
      {name && <input type="hidden" name={name} value={value} />}
    </div>
  );
}
