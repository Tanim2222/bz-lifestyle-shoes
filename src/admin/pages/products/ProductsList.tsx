import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import DataTable, { type Column } from "../../components/DataTable";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import ProductFormModal from "./ProductFormModal";
import { useAuth } from "../../context/AuthContext";
import * as productsService from "../../services/products.service";
import * as categoriesService from "../../services/categories.service";
import type { Product, Category } from "../../types";

function formatPeso(value: number): string {
  return `₱${value.toLocaleString("en-PH")}`;
}

export default function ProductsList() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | "new" | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    const [p, c] = await Promise.all([productsService.getProducts(), categoriesService.getCategories()]);
    setProducts(p);
    setCategories(c);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "Uncategorized";
  const totalStock = (product: Product) => product.variants.reduce((sum, v) => sum + v.stock, 0);

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    await productsService.deleteProduct(deletingProduct.id);
    setIsDeleting(false);
    setDeletingProduct(null);
    load();
  };

  const columns: Column<Product>[] = [
    {
      key: "product",
      header: "Product",
      render: (p) => (
        <div className="flex items-center gap-3">
          <img src={p.imageUrl} alt={p.name} className="w-11 h-11 rounded-lg object-cover bg-white/5" />
          <div>
            <p className="font-medium text-white">{p.name}</p>
            <p className="text-xs text-white/50">{p.colorway}</p>
          </div>
        </div>
      ),
    },
    { key: "category", header: "Category", render: (p) => <span className="text-white/70">{categoryName(p.categoryId)}</span> },
    { key: "price", header: "Price", render: (p) => formatPeso(p.price) },
    { key: "stock", header: "Total Stock", render: (p) => totalStock(p) },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${p.active ? "bg-teal-400/10 text-teal-300 border-teal-400/20" : "bg-white/5 text-white/40 border-white/10"}`}>
          {p.active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setEditingProduct(p)}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Edit product"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {user?.role === "admin" && (
            <button
              onClick={() => setDeletingProduct(p)}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              aria-label="Delete product"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-white/50 text-sm">{products.length} products</p>
        <button
          onClick={() => setEditingProduct("new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-black text-sm font-bold hover:from-teal-300 hover:to-cyan-300 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        keyExtractor={(p) => p.id}
        searchPlaceholder="Search products..."
        searchKeys={["name", "colorway"]}
        isLoading={isLoading}
        emptyState={
          <EmptyState
            icon={Package}
            title="No products yet"
            description="Add your first product to start building the catalog."
          />
        }
      />

      {editingProduct && (
        <ProductFormModal
          product={editingProduct === "new" ? null : editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(null)}
          onSaved={() => {
            setEditingProduct(null);
            load();
          }}
        />
      )}

      <ConfirmDialog
        open={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDelete}
        title="Delete this product?"
        description={`"${deletingProduct?.name} ${deletingProduct?.colorway}" will be permanently removed from the catalog.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
