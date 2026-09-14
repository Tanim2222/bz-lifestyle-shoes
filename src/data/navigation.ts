export interface MegaMenuColumn {
  heading: string;
  links: { label: string; href: string }[];
}

export interface NavItem {
  label: string;
  href: string;
  accent?: boolean;
  megaMenu?: MegaMenuColumn[];
}

// Header nav + mega-menu content. Pure config — swap labels/hrefs/links here
// without touching Header.tsx or MegaMenu.tsx. Shoe links point at the real
// catalog (/shop, optionally ?category=<name>) rather than a same-page
// anchor; apparel/accessories links stay "#" since those aren't real
// product categories yet — wire them up once they are.
export const navItems: NavItem[] = [
  {
    label: "Men",
    href: "/shop",
    megaMenu: [
      {
        heading: "Shoes",
        links: [
          { label: "Basketball", href: "/shop?category=Basketball" },
          { label: "Running", href: "/shop?category=Running" },
          { label: "Lifestyle", href: "/shop?category=Lifestyle" },
        ],
      },
      {
        heading: "Apparel",
        links: [
          { label: "Tops", href: "#" },
          { label: "Bottoms", href: "#" },
          { label: "Outerwear", href: "#" },
        ],
      },
    ],
  },
  {
    label: "Women",
    href: "/shop",
    megaMenu: [
      {
        heading: "Shoes",
        links: [
          { label: "Running", href: "/shop?category=Running" },
          { label: "Lifestyle", href: "/shop?category=Lifestyle" },
          { label: "Training", href: "/shop" },
        ],
      },
      {
        heading: "Apparel",
        links: [
          { label: "Tops", href: "#" },
          { label: "Leggings", href: "#" },
          { label: "Outerwear", href: "#" },
        ],
      },
    ],
  },
  {
    label: "Kids",
    href: "/shop",
    megaMenu: [
      {
        heading: "Shoes",
        links: [
          { label: "Big Kids", href: "/shop" },
          { label: "Little Kids", href: "/shop" },
          { label: "Toddler", href: "/shop" },
        ],
      },
      {
        heading: "More",
        links: [
          { label: "New Arrivals", href: "/shop" },
          { label: "Accessories", href: "#" },
        ],
      },
    ],
  },
  { label: "Brands", href: "#brands" },
  { label: "Sale", href: "/shop?sale=true", accent: true },
];
