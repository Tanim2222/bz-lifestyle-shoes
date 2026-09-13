import type { AccentColor } from "../../types";

const ACCENT_OPTIONS: { value: AccentColor; label: string; swatchClass: string }[] = [
  { value: "teal", label: "Teal", swatchClass: "bg-teal-400" },
  { value: "red", label: "Red", swatchClass: "bg-red-500" },
  { value: "amber", label: "Amber", swatchClass: "bg-amber-400" },
  { value: "fuchsia", label: "Fuchsia", swatchClass: "bg-fuchsia-500" },
  { value: "cyan", label: "Cyan", swatchClass: "bg-cyan-400" },
  { value: "neutral", label: "Neutral", swatchClass: "bg-neutral-500" },
];

export default function AccentColorPicker({ value, onChange }: { value: AccentColor; onChange: (v: AccentColor) => void }) {
  return (
    <div className="flex gap-2">
      {ACCENT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          title={opt.label}
          className={`w-7 h-7 rounded-full ${opt.swatchClass} border-2 transition-transform cursor-pointer ${
            value === opt.value ? "border-white scale-110" : "border-transparent"
          }`}
        />
      ))}
    </div>
  );
}
