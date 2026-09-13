import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";

// Full-width lifestyle/editorial section — no photo asset yet, so this uses a
// bold gradient + typography treatment. Swap the div's background for a real
// photo/video (object-cover, absolute inset-0) once creative is ready.
export default function EditorialBanner() {
  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-28">
      <Reveal>
        <div className="relative w-full overflow-hidden border border-white/10 min-h-[360px] sm:min-h-[420px] flex items-end p-8 sm:p-14 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(45,212,191,0.12),transparent_60%)]" />
          <div className="relative z-10 max-w-xl">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-teal-300 mb-4">Sneaker Culture</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1] mb-5">
              Built on the street. Worn on the court.
            </h2>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-7 max-w-md">
              Go behind the design with our lookbook — the people, the cities, and the culture shaping every BZ Lifestyle release.
            </p>
            <a
              href="#"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors cursor-pointer"
            >
              View the Lookbook
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
