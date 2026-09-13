// Philippine Standard Geographic Code lookups — free, static, no API key.
// https://psgc.gitlab.io/api/
const BASE = "https://psgc.gitlab.io/api";

export interface PsgcOption {
  code: string;
  name: string;
}

async function fetchList(path: string): Promise<PsgcOption[]> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`PSGC lookup failed (${path}).`);
  const data = (await res.json()) as { code: string; name: string }[];
  return data.map((d) => ({ code: d.code, name: d.name })).sort((a, b) => a.name.localeCompare(b.name));
}

export const getRegions = () => fetchList("/regions/");

// NCR has no provinces — its cities/municipalities hang directly off the
// region instead. Callers should fall back to getCitiesByRegion() when this
// returns an empty list.
export const getProvinces = (regionCode: string) => fetchList(`/regions/${regionCode}/provinces/`);

export const getCitiesByProvince = (provinceCode: string) => fetchList(`/provinces/${provinceCode}/cities-municipalities/`);

export const getCitiesByRegion = (regionCode: string) => fetchList(`/regions/${regionCode}/cities-municipalities/`);

export const getBarangays = (cityCode: string) => fetchList(`/cities-municipalities/${cityCode}/barangays/`);
