import { Zap, Mountain, Wind, Flame, Building2, Shield, type LucideIcon } from "lucide-react";

// Brand spotlight strip. Using fictional placeholder brand names/wordmarks
// instead of real, trademarked brand logos (Nike/Adidas/etc.) since this repo
// has no licensing for those marks — swap `icon` for a real logo image once
// you have licensed assets or your own carried brands.
export interface BrandSpotlight {
  id: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  href: string;
}

export const brandSpotlights: BrandSpotlight[] = [
  { id: "apex", name: "APEX ATHLETIC", tagline: "Performance running", icon: Zap, href: "#brands" },
  { id: "northpeak", name: "NORTHPEAK", tagline: "Trail & outdoor", icon: Mountain, href: "#brands" },
  { id: "strideco", name: "STRIDECO", tagline: "Everyday comfort", icon: Wind, href: "#brands" },
  { id: "velocity", name: "VELOCITY", tagline: "Speed & training", icon: Flame, href: "#brands" },
  { id: "urbanform", name: "URBAN FORM", tagline: "Street lifestyle", icon: Building2, href: "#brands" },
  { id: "gridiron", name: "GRIDIRON CO.", tagline: "Court & field", icon: Shield, href: "#brands" },
];
