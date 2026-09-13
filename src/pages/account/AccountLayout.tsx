import { NavLink, Outlet } from "react-router-dom";
import { User, Package, MapPin, Heart } from "lucide-react";
import Header from "../../components/landing/Header";
import Footer from "../../components/landing/Footer";
import CartDrawer from "../../components/landing/CartDrawer";

const NAV_ITEMS = [
  { to: "/account", label: "Profile", icon: User, end: true },
  { to: "/account/orders", label: "My Orders", icon: Package, end: false },
  { to: "/account/addresses", label: "Saved Addresses", icon: MapPin, end: false },
  { to: "/account/wishlist", label: "Wishlist", icon: Heart, end: false },
];

export default function AccountLayout() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
      <Header />
      <CartDrawer />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                  isActive ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="min-w-0">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}
