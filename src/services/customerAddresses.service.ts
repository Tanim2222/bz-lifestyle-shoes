import { supabase } from "../admin/services/supabaseClient";
import type { CustomerAddress, CustomerAddressInput } from "../types/customerAccount";

interface AddressRow {
  id: string;
  customer_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  street: string;
  barangay_code: string;
  barangay_name: string;
  city_code: string;
  city_name: string;
  province_code: string;
  province_name: string;
  region_code: string;
  region_name: string;
  zip: string;
  is_default: boolean;
}

function mapRow(row: AddressRow): CustomerAddress {
  return {
    id: row.id,
    customerId: row.customer_id,
    label: row.label,
    recipientName: row.recipient_name,
    phone: row.phone,
    street: row.street,
    barangayCode: row.barangay_code ?? "",
    barangayName: row.barangay_name,
    cityCode: row.city_code ?? "",
    cityName: row.city_name,
    provinceCode: row.province_code ?? "",
    provinceName: row.province_name,
    regionCode: row.region_code ?? "",
    regionName: row.region_name,
    zip: row.zip,
    isDefault: row.is_default,
  };
}

export async function getAddresses(customerId: string): Promise<CustomerAddress[]> {
  const { data, error } = await supabase
    .from("customer_addresses")
    .select("*")
    .eq("customer_id", customerId)
    .order("is_default", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as AddressRow[]).map(mapRow);
}

export async function addAddress(customerId: string, input: CustomerAddressInput): Promise<CustomerAddress> {
  // A newly added address that's marked default should actually become the
  // only default — clear any existing one first (two round-trips, but this
  // is a rare, low-frequency action, not worth a DB function for).
  if (input.isDefault) {
    await supabase.from("customer_addresses").update({ is_default: false }).eq("customer_id", customerId);
  }

  const { data, error } = await supabase
    .from("customer_addresses")
    .insert({
      customer_id: customerId,
      label: input.label,
      recipient_name: input.recipientName,
      phone: input.phone,
      street: input.street,
      barangay_code: input.barangayCode,
      barangay_name: input.barangayName,
      city_code: input.cityCode,
      city_name: input.cityName,
      province_code: input.provinceCode,
      province_name: input.provinceName,
      region_code: input.regionCode,
      region_name: input.regionName,
      zip: input.zip,
      is_default: input.isDefault,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data as AddressRow);
}

export async function setDefaultAddress(customerId: string, addressId: string): Promise<void> {
  await supabase.from("customer_addresses").update({ is_default: false }).eq("customer_id", customerId);
  const { error } = await supabase.from("customer_addresses").update({ is_default: true }).eq("id", addressId);
  if (error) throw new Error(error.message);
}

export async function deleteAddress(addressId: string): Promise<void> {
  const { error } = await supabase.from("customer_addresses").delete().eq("id", addressId);
  if (error) throw new Error(error.message);
}
