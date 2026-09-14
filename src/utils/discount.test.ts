import { describe, it, expect } from "vitest";
import { calculateDiscount } from "./discount";

describe("calculateDiscount", () => {
  it("computes a percentage discount", () => {
    expect(calculateDiscount(1000, "percentage", 10)).toBe(100);
  });

  it("computes a fixed discount", () => {
    expect(calculateDiscount(1000, "fixed", 150)).toBe(150);
  });

  it("caps the discount at the subtotal (never goes negative)", () => {
    expect(calculateDiscount(100, "fixed", 500)).toBe(100);
  });

  it("never returns a negative discount for a bad/negative value", () => {
    expect(calculateDiscount(1000, "fixed", -50)).toBe(0);
  });

  it("rounds to the nearest peso", () => {
    expect(calculateDiscount(999, "percentage", 10)).toBe(100); // 99.9 -> 100
  });

  it("returns 0 when there's nothing to discount", () => {
    expect(calculateDiscount(0, "percentage", 10)).toBe(0);
  });
});
