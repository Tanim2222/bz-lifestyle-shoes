import { useState, type FormEvent } from "react";
import { Send, Check } from "lucide-react";
import Reveal from "./Reveal";

// Local-only form stub — no email backend wired up yet. Swap handleSubmit
// for a real API call (e.g. a Supabase table or an email provider) when ready.
export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
  };

  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-28">
      <Reveal className="w-full border border-neutral-800 bg-neutral-900 p-8 sm:p-12 flex flex-col items-center text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">Get 10% off your first order</h2>
        <p className="text-white/60 text-sm sm:text-base mb-7 max-w-md">Sign up for restock alerts, new drops, and exclusive member pricing.</p>

        {submitted ? (
          <div className="flex items-center gap-2 text-teal-300 font-semibold text-sm">
            <Check className="w-4 h-4" />
            You're on the list — check your inbox soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full max-w-md flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            />
            <button
              type="submit"
              className="shrink-0 px-6 py-3 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 text-black font-bold text-sm hover:from-teal-300 hover:to-cyan-300 transition-all cursor-pointer flex items-center gap-2"
            >
              Subscribe
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </Reveal>
    </section>
  );
}
