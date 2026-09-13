import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { supabase } from "../../admin/services/supabaseClient";
import * as addressesService from "../../services/customerAddresses.service";
import AddressFields, { EMPTY_ADDRESS_LOCATION, formatAddressLocation, type AddressLocationValue } from "../AddressFields";
import type { CustomerAddress } from "../../types/customerAccount";

function formatPeso(value: number): string {
  return `₱${value.toLocaleString("en-PH")}`;
}

interface ShippingForm extends AddressLocationValue {
  name: string;
  email: string;
  phone: string;
}

const EMPTY_SHIPPING: ShippingForm = { name: "", email: "", phone: "", ...EMPTY_ADDRESS_LOCATION };

const inputClass =
  "w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed";

function toShippingForm(name: string, email: string, phone: string, addr: CustomerAddress): ShippingForm {
  return {
    name,
    email,
    phone,
    street: addr.street,
    regionCode: addr.regionCode,
    regionName: addr.regionName,
    provinceCode: addr.provinceCode,
    provinceName: addr.provinceName,
    cityCode: addr.cityCode,
    cityName: addr.cityName,
    barangayCode: addr.barangayCode,
    barangayName: addr.barangayName,
    zip: addr.zip,
  };
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, setQuantity, subtotal } = useCart();
  const { customer, openAuthModal } = useCustomerAuth();
  const [step, setStep] = useState<"cart" | "shipping">("cart");
  const [shipping, setShipping] = useState<ShippingForm>(EMPTY_SHIPPING);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  // Set when a logged-out visitor tries to check out — they're sent to sign
  // in/up first, and once that succeeds this carries them straight into the
  // shipping step instead of making them click "Continue" a second time.
  const [pendingCheckout, setPendingCheckout] = useState(false);

  // Logged-in customers get their profile prefilled immediately.
  useEffect(() => {
    if (!customer) {
      setShipping(EMPTY_SHIPPING);
      setSavedAddresses([]);
      setSelectedAddressId("");
      return;
    }
    setShipping((prev) => ({ ...prev, name: customer.name, email: customer.email, phone: customer.phone }));

    if (pendingCheckout) {
      setPendingCheckout(false);
      setStep("shipping");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer]);

  // Saved addresses are (re)fetched fresh every time the shipping step is
  // actually entered — not just when `customer` changes — so an address
  // added elsewhere (e.g. the Saved Addresses page) while this same
  // CartDrawer instance stayed mounted shows up immediately instead of
  // leaving the form blank/stale.
  useEffect(() => {
    if (!customer || step !== "shipping") return;
    addressesService
      .getAddresses(customer.id)
      .then((addresses) => {
        setSavedAddresses(addresses);
        const preferred = addresses.find((a) => a.isDefault) ?? addresses[0];
        if (preferred) {
          setSelectedAddressId(preferred.id);
          setShipping((prev) => ({ ...toShippingForm(prev.name, prev.email, prev.phone, preferred) }));
        }
      })
      .catch(() => setCheckoutError("Could not load your saved addresses."));
  }, [customer, step]);

  const handleContinueToShipping = () => {
    if (!customer) {
      setPendingCheckout(true);
      openAuthModal();
      return;
    }
    setStep("shipping");
  };

  const handleSelectSavedAddress = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedAddressId(id);
    if (id === "") {
      setShipping((prev) => ({ ...prev, ...EMPTY_ADDRESS_LOCATION }));
      return;
    }
    const addr = savedAddresses.find((a) => a.id === id);
    if (addr) setShipping((prev) => toShippingForm(prev.name, prev.email, prev.phone, addr));
  };

  const handleShippingSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCheckoutError("");
    setIsCheckingOut(true);
    try {
      const shippingAddress = formatAddressLocation(shipping);

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (customer) {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (token) headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers,
        body: JSON.stringify({
          items,
          customer: { name: shipping.name, email: shipping.email, phone: shipping.phone },
          shippingAddress,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Could not start checkout.");
      window.location.href = json.url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Could not start checkout.");
      setIsCheckingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[95] w-full max-w-md bg-white border-l border-neutral-200 flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                {step === "shipping" && (
                  <button
                    onClick={() => setStep("cart")}
                    className="w-8 h-8 -ml-1.5 rounded-full flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                    aria-label="Back to cart"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <h2 className="text-base font-bold text-neutral-900">
                  {step === "cart" ? `Your Cart ${items.length > 0 ? `(${items.length})` : ""}` : "Shipping Details"}
                </h2>
              </div>
              <button onClick={closeCart} className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer" aria-label="Close cart">
                <X className="w-4 h-4" />
              </button>
            </div>

            {step === "shipping" ? (
              <form id="shipping-form" onSubmit={handleShippingSubmit} className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                {savedAddresses.length > 0 && (
                  <select value={selectedAddressId} onChange={handleSelectSavedAddress} className={inputClass}>
                    {savedAddresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label} — {a.street}
                      </option>
                    ))}
                    <option value="">Use a different address...</option>
                  </select>
                )}

                <input
                  required
                  placeholder="Full name"
                  value={shipping.name}
                  onChange={(e) => setShipping((prev) => ({ ...prev, name: e.target.value }))}
                  className={inputClass}
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={shipping.email}
                  onChange={(e) => setShipping((prev) => ({ ...prev, email: e.target.value }))}
                  className={inputClass}
                />
                <input
                  required
                  type="tel"
                  placeholder="Phone number"
                  value={shipping.phone}
                  onChange={(e) => setShipping((prev) => ({ ...prev, phone: e.target.value }))}
                  className={inputClass}
                />

                <AddressFields value={shipping} onChange={(next) => setShipping((prev) => ({ ...prev, ...next }))} onError={setCheckoutError} inputClassName={inputClass} />
              </form>
            ) : items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-6 h-6 text-neutral-400" />
                </div>
                <p className="text-sm text-neutral-500">Your cart is empty.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                    <div className="w-20 h-20 shrink-0 bg-neutral-100 flex items-center justify-center overflow-hidden">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">
                        {item.name} {item.colorway}
                      </p>
                      <p className="text-xs text-neutral-500 mb-2">Size {item.size}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 border border-neutral-200 rounded-full px-1">
                          <button
                            onClick={() => setQuantity(item.productId, item.size, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:text-neutral-900 cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-semibold text-neutral-900 w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => setQuantity(item.productId, item.size, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:text-neutral-900 cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-neutral-900">{formatPeso(item.price * item.quantity)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.size)}
                      className="self-start text-neutral-300 hover:text-red-500 transition-colors cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className="border-t border-neutral-200 px-5 py-4 flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="font-bold text-neutral-900">{formatPeso(subtotal)}</span>
                </div>
                {checkoutError && <p className="text-xs text-red-500">{checkoutError}</p>}
                {step === "cart" ? (
                  <button
                    onClick={handleContinueToShipping}
                    className="w-full py-3.5 rounded-full bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    {customer ? "Continue to Shipping" : "Sign In to Check Out"}
                  </button>
                ) : (
                  <button
                    type="submit"
                    form="shipping-form"
                    disabled={isCheckingOut}
                    className="w-full py-3.5 rounded-full bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isCheckingOut && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {isCheckingOut ? "Redirecting to checkout..." : "Continue to Payment"}
                  </button>
                )}
                <p className="text-[11px] text-neutral-400 text-center">
                  {step !== "cart"
                    ? "You'll enter payment details on the next (secure) page."
                    : customer
                      ? "Shipping and taxes calculated at checkout."
                      : "An account keeps your orders and addresses saved for next time."}
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
