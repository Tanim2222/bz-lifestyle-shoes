import { useEffect, useState, type FormEvent } from "react";
import { MapPin, Trash2, Star, Plus } from "lucide-react";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import * as addressesService from "../../services/customerAddresses.service";
import AddressFields, { EMPTY_ADDRESS_LOCATION, type AddressLocationValue } from "../../components/AddressFields";
import type { CustomerAddress } from "../../types/customerAccount";

const inputClass =
  "w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400";

interface NewAddressForm extends AddressLocationValue {
  label: string;
  recipientName: string;
  phone: string;
  isDefault: boolean;
}

const EMPTY_FORM: NewAddressForm = { label: "Home", recipientName: "", phone: "", isDefault: false, ...EMPTY_ADDRESS_LOCATION };

export default function Addresses() {
  const { customer } = useCustomerAuth();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<NewAddressForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    if (!customer) return;
    const data = await addressesService.getAddresses(customer.id);
    setAddresses(data);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer]);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setError("");
    setIsSaving(true);
    try {
      await addressesService.addAddress(customer.id, form);
      setForm(EMPTY_FORM);
      setIsAdding(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this address.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!customer) return;
    await addressesService.setDefaultAddress(customer.id, addressId);
    await load();
  };

  const handleDelete = async (addressId: string) => {
    await addressesService.deleteAddress(addressId);
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-neutral-900">Saved Addresses</h1>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Address
          </button>
        )}
      </div>
      <p className="text-sm text-neutral-500 mb-6">Save multiple addresses so checkout only takes a couple of taps.</p>

      {isAdding && (
        <form onSubmit={handleAdd} className="border border-neutral-200 rounded-2xl p-5 mb-6 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Label (e.g. Home, Work)" value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} className={inputClass} />
            <input required placeholder="Recipient name" value={form.recipientName} onChange={(e) => setForm((p) => ({ ...p, recipientName: e.target.value }))} className={inputClass} />
          </div>
          <input required type="tel" placeholder="Phone number" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className={inputClass} />

          <AddressFields value={form} onChange={(next) => setForm((prev) => ({ ...prev, ...next }))} onError={setError} inputClassName={inputClass} />

          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))} />
            Set as default address
          </label>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2">
            <button type="submit" disabled={isSaving} className="px-6 py-2.5 rounded-full bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-60">
              {isSaving ? "Saving..." : "Save Address"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setForm(EMPTY_FORM);
                setError("");
              }}
              className="px-6 py-2.5 rounded-full border border-neutral-200 text-neutral-600 text-sm font-bold hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      ) : addresses.length === 0 && !isAdding ? (
        <div className="py-16 text-center border border-dashed border-neutral-200 rounded-2xl">
          <MapPin className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">No saved addresses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addresses.map((addr) => (
            <div key={addr.id} className="border border-neutral-200 rounded-2xl p-4 flex flex-col gap-1.5 relative">
              {addr.isDefault && (
                <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-teal-600 uppercase">
                  <Star className="w-3 h-3 fill-teal-600" /> Default
                </span>
              )}
              <p className="text-sm font-bold text-neutral-900">{addr.label}</p>
              <p className="text-sm text-neutral-700">{addr.recipientName}</p>
              <p className="text-xs text-neutral-500">{addr.phone}</p>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {addr.street}, {addr.barangayName && `Brgy. ${addr.barangayName}, `}
                {addr.cityName}, {addr.provinceName} {addr.zip}
              </p>
              <div className="flex gap-3 mt-2">
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr.id)} className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer">
                    Set as default
                  </button>
                )}
                <button onClick={() => handleDelete(addr.id)} className="text-xs font-semibold text-red-500 hover:text-red-600 cursor-pointer flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
