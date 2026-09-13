import { Routes, Route } from "react-router-dom";
import CustomerProtectedRoute from "./CustomerProtectedRoute";
import AccountLayout from "./AccountLayout";
import Profile from "./Profile";
import Orders from "./Orders";
import Addresses from "./Addresses";
import Wishlist from "./Wishlist";

export default function AccountApp() {
  return (
    <Routes>
      <Route
        element={
          <CustomerProtectedRoute>
            <AccountLayout />
          </CustomerProtectedRoute>
        }
      >
        <Route index element={<Profile />} />
        <Route path="orders" element={<Orders />} />
        <Route path="addresses" element={<Addresses />} />
        <Route path="wishlist" element={<Wishlist />} />
      </Route>
    </Routes>
  );
}
