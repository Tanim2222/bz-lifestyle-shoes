import Reveal from "./Reveal";
import { brandSpotlights } from "../../data/brands";

export default function BrandStrip() {
  return (
    <section id="brands" className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-28">
      <Reveal>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-6">Brands We Carry</h2>
      </Reveal>
      <Reveal delay={0.1} className="flex flex-wrap items-center gap-3 sm:gap-4">
        {brandSpotlights.map((brand) => (
          <a
            key={brand.id}
            href={brand.href}
            className="px-6 py-4 bg-neutral-100 border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors cursor-pointer text-sm font-bold tracking-widest uppercase"
          >
            {brand.name}
          </a>
        ))}
      </Reveal>
    </section>
  );
}
