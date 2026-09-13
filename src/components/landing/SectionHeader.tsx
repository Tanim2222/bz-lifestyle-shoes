import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";

export default function SectionHeader({
  title,
  subtitle,
  shopAllHref,
}: {
  title: string;
  subtitle?: string;
  shopAllHref?: string;
}) {
  return (
    <Reveal className="flex items-end justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">{title}</h2>
        {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
      </div>
      {shopAllHref && (
        <a href={shopAllHref} className="group shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-900 hover:text-red-500 transition-colors cursor-pointer">
          Shop All
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      )}
    </Reveal>
  );
}
