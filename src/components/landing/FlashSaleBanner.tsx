import { ArrowRight, Zap } from "lucide-react";
import Reveal from "./Reveal";

// Extra "ad" strip — a bold, high-contrast promo banner sitting right under
// the hero so the page reads as retail/promo-dense, not just a clean catalog.
export default function FlashSaleBanner() {
  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <Reveal>
        <a
          href="#featured"
          className="group flex flex-col sm:flex-row items-center justify-between gap-3 w-full bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-6 sm:px-8 py-4 sm:py-5 cursor-pointer"
        >
          <div className="flex items-center gap-3 text-center sm:text-left">
            <Zap className="w-5 h-5 text-white shrink-0 fill-white" />
            <span className="text-white font-extrabold text-sm sm:text-base tracking-tight">
              FLASH SALE — Up to 50% off select pairs, today only
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-white font-bold text-sm shrink-0 group-hover:gap-2.5 transition-all">
            Shop the Sale
            <ArrowRight className="w-4 h-4" />
          </span>
        </a>
      </Reveal>
    </section>
  );
}
