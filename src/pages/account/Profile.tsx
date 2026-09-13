import { useState, type FormEvent } from "react";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import * as customerAuthService from "../../services/customerAuth.service";

const SIZE_OPTIONS = ["US 6", "US 6.5", "US 7", "US 7.5", "US 8", "US 8.5", "US 9", "US 9.5", "US 10", "US 10.5", "US 11", "US 11.5", "US 12"];

const inputClass =
  "w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400";

export default function Profile() {
  const { customer, refresh } = useCustomerAuth();
  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [shoeSize, setShoeSize] = useState(customer?.shoeSizePreference ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  if (!customer) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setIsSaving(true);
    try {
      await customerAuthService.updateProfile(customer.id, { name, phone, shoeSizePreference: shoeSize });
      await refresh();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">My Profile</h1>
      <p className="text-sm text-neutral-500 mb-6">Member since your first sign-up — keep this up to date so orders reach you.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Full Name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Email</label>
          <input disabled value={customer.email} className={`${inputClass} bg-neutral-50 text-neutral-400`} />
          <p className="text-[11px] text-neutral-400">Email can't be changed here — contact support if you need to update it.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Phone</label>
          <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Shoe Size Preference</label>
          <select value={shoeSize} onChange={(e) => setShoeSize(e.target.value)} className={inputClass}>
            <option value="">Not set</option>
            {SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
        {saved && <p className="text-xs text-teal-600">Profile saved.</p>}

        <button
          type="submit"
          disabled={isSaving}
          className="w-fit px-6 py-3 rounded-full bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
