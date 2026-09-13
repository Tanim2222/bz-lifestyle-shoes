export type DiscountType = "percentage" | "fixed";

export interface Promotion {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  value: number;
  startDate: string;
  endDate: string;
  active: boolean;
  usageCount: number;
}

export type PromotionInput = Omit<Promotion, "id" | "usageCount">;
