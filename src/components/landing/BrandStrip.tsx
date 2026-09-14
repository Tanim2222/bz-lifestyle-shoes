import Reveal from "./Reveal";
import { brandSpotlights } from "../../data/brands";

export default function BrandStrip() {
  return (
    <section id="brands" className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-28">
      <Reveal>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-1">Brands We Carry</h2>
        <p className="text-sm text-neutral-500 mb-6">The labels behind every pair on the shelf</p>
      </Reveal>
      <Reveal delay={0.1} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {brandSpotlights.map((brand) => (
          <a
            key={brand.id}
            href={brand.href}
            className="group flex flex-col items-center justify-center gap-2.5 px-4 py-6 bg-neutral-50 border border-neutral-200 hover:border-neutral-900 hover:bg-white hover:shadow-md transition-all cursor-pointer text-center"
          >
            <div className="w-11 h-11 rounded-full bg-neutral-900 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <brand.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-neutral-900">{brand.name}</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">{brand.tagline}</p>
            </div>
          </a>
        ))}
      </Reveal>
    </section>
  );
}
