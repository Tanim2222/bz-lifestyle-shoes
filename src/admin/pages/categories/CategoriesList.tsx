import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tags } from "lucide-react";
import DataTable, { type Column } from "../../components/DataTable";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import CategoryFormModal from "./CategoryFormModal";
import { useAuth } from "../../context/AuthContext";
import * as categoriesService from "../../services/categories.service";
import * as productsService from "../../services/products.service";
import type { Category } from "../../types";

export default function CategoriesList() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    const [cats, products] = await Promise.all([categoriesService.getCategories(), productsService.getProducts()]);
    const counts: Record<string, number> = {};
    for (const p of products) counts[p.categoryId] = (counts[p.categoryId] ?? 0) + 1;
    setCategories(cats);
    setProductCounts(counts);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    await categoriesService.deleteCategory(deleting.id);
    setIsDeleting(false);
    setDeleting(null);
    load();
  };

  const columns: Column<Category>[] = [
    { key: "name", header: "Name", render: (c) => <span className="font-medium text-white">{c.name}</span> },
    { key: "slug", header: "Slug", render: (c) => <span className="text-white/50 font-mono text-xs">{c.slug}</span> },
    { key: "description", header: "Description", render: (c) => <span className="text-white/70">{c.description}</span> },
    { key: "products", header: "Products", render: (c) => productCounts[c.id] ?? 0 },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (c) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setEditing(c)}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Edit category"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {user?.role === "admin" && (
            <button
              onClick={() => setDeleting(c)}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              aria-label="Delete category"
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
        <p className="text-white/50 text-sm">{categories.length} categories</p>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-black text-sm font-bold hover:from-teal-300 hover:to-cyan-300 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        keyExtractor={(c) => c.id}
        searchPlaceholder="Search categories..."
        searchKeys={["name"]}
        isLoading={isLoading}
        emptyState={<EmptyState icon={Tags} title="No categories yet" description="Create a category to start organizing products." />}
      />

      {editing && (
        <CategoryFormModal
          category={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete this category?"
        description={`"${deleting?.name}" will be removed. Products in this category will keep their reference until reassigned.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
