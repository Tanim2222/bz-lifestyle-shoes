import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useCustomerAuth } from "./CustomerAuthContext";
import * as wishlistService from "../services/wishlist.service";

interface WishlistContextValue {
  productIds: Set<string>;
  count: number;
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { customer } = useCustomerAuth();
  const [productIds, setProductIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!customer) {
      setProductIds(new Set());
      return;
    }
    wishlistService.getWishlistProductIds(customer.id).then((ids) => setProductIds(new Set(ids)));
  }, [customer]);

  const isWishlisted = (productId: string) => productIds.has(productId);

  const toggle = async (productId: string) => {
    if (!customer) return;
    const wasWishlisted = productIds.has(productId);

    // Optimistic update — the heart should flip instantly, not after a
    // round-trip.
    setProductIds((prev) => {
      const next = new Set(prev);
      if (wasWishlisted) next.delete(productId);
      else next.add(productId);
      return next;
    });

    try {
      if (wasWishlisted) await wishlistService.removeFromWishlist(customer.id, productId);
      else await wishlistService.addToWishlist(customer.id, productId);
    } catch {
      // Roll back on failure.
      setProductIds((prev) => {
        const next = new Set(prev);
        if (wasWishlisted) next.add(productId);
        else next.delete(productId);
        return next;
      });
    }
  };

  return (
    <WishlistContext.Provider value={{ productIds, count: productIds.size, isWishlisted, toggle }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider.");
  return ctx;
}
