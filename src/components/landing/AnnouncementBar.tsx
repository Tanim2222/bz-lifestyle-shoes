import { useState } from "react";
import { X } from "lucide-react";

const MESSAGES = ["Free shipping on orders over ₱2,000", "BZ Rewards members get early access to new drops"];

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="relative w-full bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white text-center py-2 px-10 text-[11px] sm:text-xs font-semibold tracking-wide">
      <span>{MESSAGES.join("   ·   ")}</span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
