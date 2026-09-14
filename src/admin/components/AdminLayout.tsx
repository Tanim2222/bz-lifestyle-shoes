import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";

const TITLES: { match: string; title: string }[] = [
  { match: "/admin/products", title: "Products" },
  { match: "/admin/categories", title: "Categories" },
  { match: "/admin/inventory", title: "Inventory" },
  { match: "/admin/orders", title: "Orders" },
  { match: "/admin/customers", title: "Customers" },
  { match: "/admin/support", title: "Support" },
  { match: "/admin/promotions", title: "Promotions" },
  { match: "/admin/reports", title: "Reports" },
  { match: "/admin/settings", title: "Settings" },
];

function titleForPath(pathname: string): string {
  const found = TITLES.find((t) => pathname.startsWith(t.match));
  return found?.title ?? "Dashboard";
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-black text-white flex font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopHeader title={titleForPath(location.pathname)} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
