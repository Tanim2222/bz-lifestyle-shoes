import { motion } from "motion/react";
import type { MegaMenuColumn } from "../../data/navigation";

export default function MegaMenu({ columns }: { columns: MegaMenuColumn[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[420px] bg-neutral-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_24px_50px_rgba(0,0,0,0.7)] grid grid-cols-2 gap-6 z-50"
    >
      {columns.map((col) => (
        <div key={col.heading}>
          <h4 className="text-[10px] uppercase font-bold tracking-wider text-white/50 mb-3">{col.heading}</h4>
          <ul className="flex flex-col gap-2">
            {col.links.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="text-sm text-white hover:text-teal-300 transition-colors cursor-pointer hover-underline">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </motion.div>
  );
}
