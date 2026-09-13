export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  size: string;
  change: number; // positive or negative delta
  resultingStock: number;
  reason: string;
  adjustedBy: string;
  createdAt: string;
}
