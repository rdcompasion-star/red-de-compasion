"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";

const PALETTE = ["#5f9c73", "#5a8cb0", "#7c5cbf", "#3f9142", "#b98d5e", "#8a8a8a"];

export function EntriesByYearChart({ data }: { data: { year: number; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ece0cd" />
        <XAxis dataKey="year" stroke="#6b6156" fontSize={12} />
        <YAxis allowDecimals={false} stroke="#6b6156" fontSize={12} />
        <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#ece0cd" }} />
        <Bar dataKey="count" name="Personas" fill="#8a6238" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusPieChart({ data }: { data: { label: string; count: number; colorHex: string }[] }) {
  const filtered = data.filter((d) => d.count > 0);
  if (filtered.length === 0) return <p className="text-sm text-[var(--color-ink-soft)]">Sin datos aún.</p>;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={filtered} dataKey="count" nameKey="label" innerRadius={60} outerRadius={100} paddingAngle={2}>
          {filtered.map((entry, i) => (
            <Cell key={entry.label} fill={entry.colorHex || PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#ece0cd" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
