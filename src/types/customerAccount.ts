export interface CustomerProfile {
  id: string;
  authUserId: string;
  name: string;
  email: string;
  phone: string;
  shoeSizePreference: string;
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  barangayCode: string;
  barangayName: string;
  cityCode: string;
  cityName: string;
  provinceCode: string;
  provinceName: string;
  regionCode: string;
  regionName: string;
  zip: string;
  isDefault: boolean;
}

export type CustomerAddressInput = Omit<CustomerAddress, "id" | "customerId">;
