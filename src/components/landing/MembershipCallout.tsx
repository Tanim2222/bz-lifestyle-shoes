import { ArrowRight, Star } from "lucide-react";
import Reveal from "./Reveal";

export default function MembershipCallout() {
  return (
    <section id="membership" className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-28">
      <Reveal>
        <div className="relative w-full overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-start gap-4 max-w-xl">
            <div className="w-11 h-11 rounded-full bg-black/15 border border-black/10 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">Join BZ Rewards</h2>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                Earn points on every purchase, get early access to new drops, and unlock members-only pricing — free to join.
              </p>
            </div>
          </div>
          <a
            href="#"
            className="group shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-black text-white font-bold text-sm hover:bg-neutral-800 transition-all cursor-pointer"
          >
            Join Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </Reveal>
    </section>
  );
}
