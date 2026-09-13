import type { LucideIcon } from "lucide-react";

export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = "teal",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  accent?: "teal" | "yellow" | "red" | "white";
}) {
  const accentClasses: Record<string, string> = {
    teal: "bg-teal-400/10 text-teal-300 border-teal-400/20",
    yellow: "bg-yellow-400/10 text-yellow-300 border-yellow-400/20",
    red: "bg-red-400/10 text-red-300 border-red-400/20",
    white: "bg-white/10 text-white border-white/20",
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${accentClasses[accent]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-semibold text-white mb-1">{value}</p>
      <p className="text-xs text-white/50 uppercase tracking-wider font-medium">{label}</p>
      {hint && <p className="text-[11px] text-white/40 mt-2">{hint}</p>}
    </div>
  );
}
