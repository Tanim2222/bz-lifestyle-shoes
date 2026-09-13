// Brand spotlight strip. Using fictional placeholder brand names/wordmarks
// instead of real, trademarked brand logos (Nike/Adidas/etc.) since this repo
// has no licensing for those marks — swap `name` for a real logo image once
// you have licensed assets or your own carried brands.
export interface BrandSpotlight {
  id: string;
  name: string;
  href: string;
}

export const brandSpotlights: BrandSpotlight[] = [
  { id: "apex", name: "APEX ATHLETIC", href: "#brands" },
  { id: "northpeak", name: "NORTHPEAK", href: "#brands" },
  { id: "strideco", name: "STRIDECO", href: "#brands" },
  { id: "velocity", name: "VELOCITY", href: "#brands" },
  { id: "urbanform", name: "URBAN FORM", href: "#brands" },
  { id: "gridiron", name: "GRIDIRON CO.", href: "#brands" },
];
