import { useEffect, useState, type ChangeEvent } from "react";
import { getRegions, getProvinces, getCitiesByProvince, getCitiesByRegion, getBarangays, type PsgcOption } from "../lib/psgc";

export interface AddressLocationValue {
  street: string;
  regionCode: string;
  regionName: string;
  provinceCode: string;
  provinceName: string;
  cityCode: string;
  cityName: string;
  barangayCode: string;
  barangayName: string;
  zip: string;
}

export const EMPTY_ADDRESS_LOCATION: AddressLocationValue = {
  street: "",
  regionCode: "",
  regionName: "",
  provinceCode: "",
  provinceName: "",
  cityCode: "",
  cityName: "",
  barangayCode: "",
  barangayName: "",
  zip: "",
};

export function formatAddressLocation(loc: AddressLocationValue): string {
  return [loc.street, loc.barangayName && `Brgy. ${loc.barangayName}`, loc.cityName, loc.provinceName, loc.zip].filter(Boolean).join(", ");
}

const DEFAULT_INPUT_CLASS =
  "w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed";

// Cascading Region -> Province -> City/Municipality -> Barangay picker
// backed by the free PSGC API (see src/lib/psgc.ts), plus street/ZIP text
// fields. Used by both the checkout shipping step and the account Addresses
// page, so the ~150 lines of lookup/loading logic only exist once.
export default function AddressFields({
  value,
  onChange,
  onError,
  inputClassName = DEFAULT_INPUT_CLASS,
}: {
  value: AddressLocationValue;
  onChange: (next: AddressLocationValue) => void;
  onError?: (message: string) => void;
  inputClassName?: string;
}) {
  const [regions, setRegions] = useState<PsgcOption[]>([]);
  const [provinces, setProvinces] = useState<PsgcOption[]>([]);
  const [cities, setCities] = useState<PsgcOption[]>([]);
  const [barangays, setBarangays] = useState<PsgcOption[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingBarangays, setIsLoadingBarangays] = useState(false);

  useEffect(() => {
    if (regions.length === 0) {
      getRegions()
        .then(setRegions)
        .catch(() => onError?.("Could not load regions. Check your connection and try again."));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-hydrate the dependent dropdowns when an existing value is loaded in
  // (e.g. editing a saved address) rather than typed fresh.
  useEffect(() => {
    if (value.regionCode && provinces.length === 0 && cities.length === 0) {
      getProvinces(value.regionCode).then((list) => {
        if (list.length > 0) setProvinces(list);
        else getCitiesByRegion(value.regionCode).then(setCities);
      });
    }
    if (value.provinceCode && cities.length === 0) {
      getCitiesByProvince(value.provinceCode).then(setCities);
    }
    if (value.cityCode && barangays.length === 0) {
      getBarangays(value.cityCode).then(setBarangays);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.regionCode, value.provinceCode, value.cityCode]);

  const handleRegionChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const regionCode = e.target.value;
    const regionName = regions.find((r) => r.code === regionCode)?.name ?? "";
    onChange({
      ...value,
      regionCode,
      regionName,
      provinceCode: "",
      provinceName: "",
      cityCode: "",
      cityName: "",
      barangayCode: "",
      barangayName: "",
    });
    setProvinces([]);
    setCities([]);
    setBarangays([]);
    if (!regionCode) return;

    setIsLoadingProvinces(true);
    try {
      const provinceList = await getProvinces(regionCode);
      if (provinceList.length > 0) {
        setProvinces(provinceList);
      } else {
        setIsLoadingCities(true);
        setCities(await getCitiesByRegion(regionCode));
        setIsLoadingCities(false);
      }
    } catch {
      onError?.("Could not load provinces for that region.");
    } finally {
      setIsLoadingProvinces(false);
    }
  };

  const handleProvinceChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const provinceCode = e.target.value;
    const provinceName = provinces.find((p) => p.code === provinceCode)?.name ?? "";
    onChange({ ...value, provinceCode, provinceName, cityCode: "", cityName: "", barangayCode: "", barangayName: "" });
    setCities([]);
    setBarangays([]);
    if (!provinceCode) return;

    setIsLoadingCities(true);
    try {
      setCities(await getCitiesByProvince(provinceCode));
    } catch {
      onError?.("Could not load cities/municipalities for that province.");
    } finally {
      setIsLoadingCities(false);
    }
  };

  const handleCityChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const cityCode = e.target.value;
    const cityName = cities.find((c) => c.code === cityCode)?.name ?? "";
    onChange({ ...value, cityCode, cityName, barangayCode: "", barangayName: "" });
    setBarangays([]);
    if (!cityCode) return;

    setIsLoadingBarangays(true);
    try {
      setBarangays(await getBarangays(cityCode));
    } catch {
      onError?.("Could not load barangays for that city/municipality.");
    } finally {
      setIsLoadingBarangays(false);
    }
  };

  const handleBarangayChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const barangayCode = e.target.value;
    const barangayName = barangays.find((b) => b.code === barangayCode)?.name ?? "";
    onChange({ ...value, barangayCode, barangayName });
  };

  return (
    <>
      <input
        required
        placeholder="Street address, building, unit no."
        value={value.street}
        onChange={(e) => onChange({ ...value, street: e.target.value })}
        className={inputClassName}
      />

      <select required value={value.regionCode} onChange={handleRegionChange} className={inputClassName}>
        <option value="">Region</option>
        {regions.map((r) => (
          <option key={r.code} value={r.code}>
            {r.name}
          </option>
        ))}
      </select>

      {(provinces.length > 0 || isLoadingProvinces) && (
        <select required value={value.provinceCode} onChange={handleProvinceChange} disabled={isLoadingProvinces} className={inputClassName}>
          <option value="">{isLoadingProvinces ? "Loading provinces..." : "Province"}</option>
          {provinces.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>
      )}

      <div className="grid grid-cols-2 gap-3">
        <select required value={value.cityCode} onChange={handleCityChange} disabled={!value.regionCode || isLoadingCities} className={inputClassName}>
          <option value="">{isLoadingCities ? "Loading..." : "City / Municipality"}</option>
          {cities.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>

        <select required value={value.barangayCode} onChange={handleBarangayChange} disabled={!value.cityCode || isLoadingBarangays} className={inputClassName}>
          <option value="">{isLoadingBarangays ? "Loading..." : "Barangay"}</option>
          {barangays.map((b) => (
            <option key={b.code} value={b.code}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <input
        required
        placeholder="ZIP code"
        value={value.zip}
        onChange={(e) => onChange({ ...value, zip: e.target.value })}
        className={inputClassName}
      />
    </>
  );
}
