import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Shoe3DViewer from "../Shoe3DViewer";
import * as heroSlidesService from "../../admin/services/heroSlides.service";
import type { HeroSlide, AccentColor } from "../../admin/types";

const AUTO_ADVANCE_MS = 6000;

const ACCENT_GRADIENTS: Record<AccentColor, string> = {
  teal: "from-teal-500/25 via-cyan-500/10 to-transparent",
  red: "from-red-500/25 via-orange-500/10 to-transparent",
  amber: "from-amber-500/20 via-yellow-500/10 to-transparent",
  fuchsia: "from-fuchsia-500/20 via-purple-500/10 to-transparent",
  cyan: "from-cyan-500/25 via-blue-500/10 to-transparent",
  neutral: "from-neutral-500/15 via-neutral-500/5 to-transparent",
};

export default function HeroCarousel() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [is3DLoaded, setIs3DLoaded] = useState(false);

  useEffect(() => {
    heroSlidesService.getHeroSlides().then((data) => {
      setSlides(data.filter((s) => s.active));
      setIsLoading(false);
    });
  }, []);

  const goTo = useCallback(
    (next: number) => {
      if (slides.length === 0) return;
      setIndex((next + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    if (isPaused || slides.length === 0) return;
    const timer = setInterval(() => goTo(index + 1), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [index, isPaused, goTo, slides.length]);

  if (isLoading) {
    return (
      <section className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="w-full min-h-[460px] sm:min-h-[520px] bg-neutral-100 border border-neutral-200 animate-pulse" />
      </section>
    );
  }

  if (slides.length === 0) return null;

  const slide = slides[index];

  return (
    <section
      id="hero"
      className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full overflow-hidden border border-neutral-800 bg-neutral-900 min-h-[460px] sm:min-h-[520px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute inset-0 bg-gradient-to-br ${ACCENT_GRADIENTS[slide.accentColor]}`}
          />
        </AnimatePresence>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center w-full px-6 sm:px-10 lg:px-14 py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={`copy-${slide.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-4 flex flex-col items-start text-left"
            >
              {slide.eyebrow && (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-xs font-bold uppercase tracking-widest mb-5">
                  {slide.eyebrow}
                </span>
              )}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-white leading-[1.08] mb-5">{slide.title}</h1>
              {slide.subtitle && <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-8 max-w-lg">{slide.subtitle}</p>}
              <a
                href={slide.ctaHref}
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-red-500 to-orange-400 text-black font-bold text-sm hover:from-red-400 hover:to-orange-300 transition-all cursor-pointer"
              >
                {slide.ctaLabel}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </AnimatePresence>

          <div className="lg:col-span-8 relative min-h-[280px] sm:min-h-[340px] flex items-center justify-center">
            {slide.is3d ? (
              <div className="relative w-full h-[300px] sm:h-[380px] overflow-hidden border border-white/10 bg-black" id="explore-3d">
                {!is3DLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center text-white/40 text-xs uppercase tracking-widest font-semibold z-10">
                    Loading 3D model...
                  </div>
                )}
                <Shoe3DViewer onProgress={() => {}} onLoaded={() => setIs3DLoaded(true)} />
              </div>
            ) : slide.videoUrl ? (
              <div className="w-full h-[280px] sm:h-[340px] overflow-hidden border border-white/10 bg-black">
                <video src={slide.videoUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
              </div>
            ) : slide.imageUrl ? (
              <div className="w-full h-[280px] sm:h-[340px] overflow-hidden border border-white/10 bg-black">
                <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full h-[280px] sm:h-[340px] bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="text-white/20 text-6xl font-black uppercase tracking-tight select-none">BZ</span>
              </div>
            )}
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <button
              onClick={() => goTo(index - 1)}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => goTo(index + 1)}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
