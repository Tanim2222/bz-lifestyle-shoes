import { useEffect, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCustomerAuth } from "../../context/CustomerAuthContext";

export default function CustomerProtectedRoute({ children }: { children: ReactNode }) {
  const { customer, isLoading, openAuthModal } = useCustomerAuth();

  useEffect(() => {
    if (!isLoading && !customer) openAuthModal();
  }, [isLoading, customer, openAuthModal]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!customer) return <Navigate to="/" replace />;

  return <>{children}</>;
}
