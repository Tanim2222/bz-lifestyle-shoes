import type { LucideIcon } from "lucide-react";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-white/50" />
      </div>
      <h3 className="text-white font-semibold text-base mb-1">{title}</h3>
      {description && <p className="text-white/50 text-sm max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
