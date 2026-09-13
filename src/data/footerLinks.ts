export interface FooterColumn {
  heading: string;
  links: { label: string; href: string }[];
}

export const footerColumns: FooterColumn[] = [
  {
    heading: "Shop",
    links: [
      { label: "New Arrivals", href: "#featured" },
      { label: "Best Sellers", href: "#trending" },
      { label: "Sale", href: "#featured" },
      { label: "Gift Cards", href: "#" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "Order Status", href: "#" },
      { label: "Shipping & Returns", href: "#" },
      { label: "Size Guide", href: "#" },
      { label: "Contact Us", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About BZ Lifestyle", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Sustainability", href: "#" },
      { label: "Store Locator", href: "#" },
    ],
  },
];
