import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CustomerProfile } from "../types/customerAccount";
import * as customerAuthService from "../services/customerAuth.service";
import { supabase } from "../admin/services/supabaseClient";

interface CustomerAuthContextValue {
  customer: CustomerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (name: string, email: string, password: string, phone: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  // Lets any component (a product card's wishlist heart, not just the
  // header) prompt a logged-out visitor to sign in, without each one having
  // to manage its own modal-open state.
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const refresh = async () => {
    const profile = await customerAuthService.getCurrentCustomer();
    setCustomer(profile);
  };

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));

    // Supabase persists the session itself — this just keeps `customer` in
    // sync with sign-outs triggered elsewhere (another tab, token expiry).
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") setCustomer(null);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const signUp = async (name: string, email: string, password: string, phone: string) => {
    const profile = await customerAuthService.signUp(name, email, password, phone);
    setCustomer(profile);
  };

  const signIn = async (email: string, password: string) => {
    const profile = await customerAuthService.signIn(email, password);
    setCustomer(profile);
  };

  const signOut = async () => {
    await customerAuthService.signOut();
    setCustomer(null);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isLoading,
        signUp,
        signIn,
        signOut,
        refresh,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth(): CustomerAuthContextValue {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used within CustomerAuthProvider.");
  return ctx;
}
