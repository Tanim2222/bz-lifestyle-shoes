import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import DashboardOverview from "./pages/DashboardOverview";
import LandingPage from "./pages/landing/LandingPage";
import ProductsList from "./pages/products/ProductsList";
import CategoriesList from "./pages/categories/CategoriesList";
import InventoryList from "./pages/inventory/InventoryList";
import OrdersList from "./pages/orders/OrdersList";
import OrderDetail from "./pages/orders/OrderDetail";
import CustomersList from "./pages/customers/CustomersList";
import CustomerDetail from "./pages/customers/CustomerDetail";
import PromotionsList from "./pages/promotions/PromotionsList";
import ChatInbox from "./pages/support/ChatInbox";
import Reports from "./pages/reports/Reports";
import Settings from "./pages/settings/Settings";

export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        {/* Login now happens via a modal on the storefront (/) — this just
            catches old bookmarks/links to the old dedicated login page. */}
        <Route path="login" element={<Navigate to="/" replace />} />
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="landing-page" element={<LandingPage />} />
          <Route path="products" element={<ProductsList />} />
          <Route path="categories" element={<CategoriesList />} />
          <Route path="inventory" element={<InventoryList />} />
          <Route path="orders" element={<OrdersList />} />
          <Route path="orders/:orderId" element={<OrderDetail />} />
          <Route path="customers" element={<CustomersList />} />
          <Route path="customers/:customerId" element={<CustomerDetail />} />
          <Route path="promotions" element={<PromotionsList />} />
          <Route path="support" element={<ChatInbox />} />
          <Route path="reports" element={<Reports />} />
          <Route
            path="settings"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
