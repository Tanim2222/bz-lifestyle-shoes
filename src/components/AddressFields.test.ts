import { describe, it, expect } from "vitest";
import { formatAddressLocation, EMPTY_ADDRESS_LOCATION } from "./AddressFields";

describe("formatAddressLocation", () => {
  it("joins a full address with the barangay prefixed", () => {
    const result = formatAddressLocation({
      ...EMPTY_ADDRESS_LOCATION,
      street: "123 Rizal St.",
      barangayName: "Poblacion",
      cityName: "Makati City",
      provinceName: "Metro Manila",
      zip: "1200",
    });
    expect(result).toBe("123 Rizal St., Brgy. Poblacion, Makati City, Metro Manila, 1200");
  });

  it("skips empty fields instead of leaving stray commas", () => {
    const result = formatAddressLocation({ ...EMPTY_ADDRESS_LOCATION, street: "123 Rizal St.", cityName: "Makati City" });
    expect(result).toBe("123 Rizal St., Makati City");
  });

  it("returns an empty string for a fully empty address", () => {
    expect(formatAddressLocation(EMPTY_ADDRESS_LOCATION)).toBe("");
  });
});
