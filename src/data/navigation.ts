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
// without touching Header.tsx or MegaMenu.tsx.
export const navItems: NavItem[] = [
  {
    label: "Men",
    href: "#featured",
    megaMenu: [
      {
        heading: "Shoes",
        links: [
          { label: "Basketball", href: "#shop-by-category" },
          { label: "Running", href: "#shop-by-category" },
          { label: "Lifestyle", href: "#shop-by-category" },
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
    href: "#featured",
    megaMenu: [
      {
        heading: "Shoes",
        links: [
          { label: "Running", href: "#shop-by-category" },
          { label: "Lifestyle", href: "#shop-by-category" },
          { label: "Training", href: "#" },
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
    href: "#featured",
    megaMenu: [
      {
        heading: "Shoes",
        links: [
          { label: "Big Kids", href: "#" },
          { label: "Little Kids", href: "#" },
          { label: "Toddler", href: "#" },
        ],
      },
      {
        heading: "More",
        links: [
          { label: "New Arrivals", href: "#featured" },
          { label: "Accessories", href: "#" },
        ],
      },
    ],
  },
  { label: "Brands", href: "#brands" },
  { label: "Sale", href: "#featured", accent: true },
];
