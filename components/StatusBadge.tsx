export function StatusBadge({ label, colorHex }: { label: string; colorHex?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border"
      style={{
        color: colorHex ?? "#6b6156",
        borderColor: (colorHex ?? "#6b6156") + "40",
        background: (colorHex ?? "#6b6156") + "14",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: colorHex ?? "#6b6156" }} aria-hidden />
      {label}
    </span>
  );
}
