import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  GalleryHorizontal,
  Package,
  Tags,
  Boxes,
  ShoppingBag,
  Users,
  Percent,
  BarChart3,
  Settings,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import logoBZLI from "../../../assets/logo/logoBZLI.png";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/landing-page", label: "Landing Page", icon: GalleryHorizontal },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/promotions", label: "Promotions", icon: Percent },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0">
          <img src={logoBZLI} alt="BZ Lifestyle Shoes" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-white font-bold text-sm uppercase tracking-wider leading-none">BZ Lifestyle</p>
          <p className="text-white/40 text-[11px] mt-1">Admin Console</p>
        </div>
      </div>

      <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-teal-400/10 text-teal-300 border border-teal-400/20"
                  : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}

        {user?.role === "admin" && (
          <NavLink
            to="/admin/settings"
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-teal-400/10 text-teal-300 border border-teal-400/20"
                  : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
              }`
            }
          >
            <Settings className="w-4 h-4" />
            Settings
          </NavLink>
        )}
      </nav>

      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-[11px] text-white/30">BZ Lifestyle Shoes © 2026</p>
      </div>
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-white/5 border-r border-white/10 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile off-canvas */}
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 top-0 h-full w-72 bg-neutral-950 border-r border-white/10"
            >
              <button
                onClick={onClose}
                className="absolute top-5 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent onNavigate={onClose} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
