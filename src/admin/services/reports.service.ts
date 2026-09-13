import type { InventoryLog } from "../types";
import * as ordersService from "./orders.service";
import * as customersService from "./customers.service";
import * as inventoryService from "./inventory.service";
import { LOW_STOCK_THRESHOLD } from "./inventory.service";

export interface DashboardMetrics {
  totalSales: number;
  ordersToday: number;
  lowStockCount: number;
  newCustomersThisWeek: number;
}

export interface SalesPoint {
  date: string; // "MMM d"
  sales: number;
}

export interface BestSeller {
  productId: string;
  productName: string;
  unitsSold: number;
  revenue: number;
}

function sameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function latestDate(dates: string[]): Date {
  if (dates.length === 0) return new Date();
  return new Date(dates.reduce((max, d) => (d > max ? d : max), dates[0]));
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [orders, inventory, customers] = await Promise.all([
    ordersService.getOrders(),
    inventoryService.getInventory(),
    customersService.getCustomers(),
  ]);

  const totalSales = orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);

  const latestOrderDate = latestDate(orders.map((o) => o.createdAt));
  const ordersToday = orders.filter((o) => sameCalendarDay(new Date(o.createdAt), latestOrderDate)).length;

  const lowStockCount = inventory.filter((row) => row.stock <= LOW_STOCK_THRESHOLD).length;

  const latestJoinDate = latestDate(customers.map((c) => c.joinedAt));
  const weekAgo = new Date(latestJoinDate);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const newCustomersThisWeek = customers.filter((c) => new Date(c.joinedAt) >= weekAgo).length;

  return { totalSales, ordersToday, lowStockCount, newCustomersThisWeek };
}

export async function getSalesTrend(days = 14): Promise<SalesPoint[]> {
  const orders = await ordersService.getOrders();
  const nonCancelled = orders.filter((o) => o.status !== "cancelled");

  const points: SalesPoint[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const sales = nonCancelled
      .filter((o) => sameCalendarDay(new Date(o.createdAt), date))
      .reduce((sum, o) => sum + o.total, 0);
    points.push({ date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }), sales });
  }
  return points;
}

export async function getBestSellers(limit = 5): Promise<BestSeller[]> {
  const orders = await ordersService.getOrders();
  const byProduct = new Map<string, BestSeller>();
  for (const order of orders) {
    if (order.status === "cancelled") continue;
    for (const item of order.items) {
      const existing = byProduct.get(item.productId);
      const revenue = item.unitPrice * item.quantity;
      if (existing) {
        existing.unitsSold += item.quantity;
        existing.revenue += revenue;
      } else {
        byProduct.set(item.productId, {
          productId: item.productId,
          productName: item.productName,
          unitsSold: item.quantity,
          revenue,
        });
      }
    }
  }
  return [...byProduct.values()].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, limit);
}

export async function getStockMovement(): Promise<InventoryLog[]> {
  return inventoryService.getInventoryLogs();
}
