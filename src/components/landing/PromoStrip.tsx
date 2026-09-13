import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import * as promoBannersService from "../../admin/services/promoBanners.service";
import type { PromoBanner, AccentColor } from "../../admin/types";

const ACCENT_GRADIENTS: Record<AccentColor, string> = {
  teal: "from-teal-500/40 to-transparent",
  red: "from-red-500/40 to-transparent",
  amber: "from-amber-500/40 to-transparent",
  fuchsia: "from-fuchsia-500/40 to-transparent",
  cyan: "from-cyan-500/40 to-transparent",
  neutral: "from-neutral-500/30 to-transparent",
};

export default function PromoStrip() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    promoBannersService.getPromoBanners().then((data) => {
      setBanners(data.filter((b) => b.active));
      setIsLoading(false);
    });
  }, []);

  if (!isLoading && banners.length === 0) return null;

  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="min-h-[160px] bg-neutral-100 border border-neutral-200 animate-pulse" />)
          : banners.map((promo, i) => (
              <Reveal key={promo.id} delay={i * 0.08}>
                <a href={promo.href} className="group relative block overflow-hidden border border-neutral-800 bg-neutral-900 p-6 min-h-[160px] flex flex-col justify-end cursor-pointer">
                  {promo.imageUrl && (
                    <img src={promo.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity duration-300" />
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-tr ${ACCENT_GRADIENTS[promo.accentColor]} opacity-70 group-hover:opacity-90 transition-opacity duration-300`} />
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-white mb-1">{promo.title}</h3>
                    {promo.copy && <p className="text-sm text-white/70 mb-4">{promo.copy}</p>}
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white group-hover:gap-2.5 transition-all">
                      {promo.ctaLabel}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </a>
              </Reveal>
            ))}
      </div>
    </section>
  );
}
