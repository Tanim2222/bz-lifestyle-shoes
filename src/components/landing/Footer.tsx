import { Instagram, Twitter, Mail } from "lucide-react";
import logoBZLI from "../../../assets/logo/logoBZLI.png";
import { footerColumns } from "../../data/footerLinks";

const PAYMENT_METHODS = ["Visa", "Mastercard", "GCash", "Maya", "COD"];

// Placeholder social links — point these at BZ Lifestyle's real accounts once
// they exist.
const SOCIALS = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Mail, href: "mailto:hello@bzlifestyle.example", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="w-full mt-24 border-t border-neutral-800 bg-neutral-950 pt-16 pb-10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          <div className="md:col-span-4 flex flex-col items-start gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden">
                <img src={logoBZLI} alt="BZ Lifestyle Shoes" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold tracking-[0.1em] text-sm text-white uppercase">BZ Lifestyle</span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed max-w-xs">
              Retail energy meets everyday performance — BZ Lifestyle Shoes brings fresh drops, real stock, and a genuine sneaker community to the Philippines.
            </p>
            <div className="flex gap-3 mt-1">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  aria-label={label}
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-6 grid grid-cols-3 gap-6">
            {footerColumns.map((col) => (
              <div key={col.heading}>
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-white mb-4">{col.heading}</h4>
                <ul className="flex flex-col gap-2.5 text-xs text-white/50">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="hover:text-white transition-colors cursor-pointer hover-underline">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="md:col-span-2 flex flex-col items-start md:items-end gap-2">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-white mb-1">We Accept</h4>
            <div className="flex flex-wrap md:justify-end gap-1.5">
              {PAYMENT_METHODS.map((method) => (
                <span key={method} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-semibold text-white/60">
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-white/10 mb-6" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-white/40 font-mono uppercase tracking-wider">
          <span>© 2026 BZ Lifestyle Shoes. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white/70 hover-underline">Privacy Policy</a>
            <a href="#" className="hover:text-white/70 hover-underline">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
