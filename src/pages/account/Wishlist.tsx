import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";
import * as productsService from "../../admin/services/products.service";
import * as categoriesService from "../../admin/services/categories.service";
import ProductCard from "../../components/landing/ProductCard";
import type { Product, Category } from "../../admin/types";

export default function Wishlist() {
  const { productIds } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([productsService.getProducts(), categoriesService.getCategories()]).then(([p, c]) => {
      setProducts(p);
      setCategories(c);
      setIsLoading(false);
    });
  }, []);

  const wishlisted = products.filter((p) => productIds.has(p.id));
  const categoryName = (categoryId: string) => categories.find((c) => c.id === categoryId)?.name ?? "";

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">My Wishlist</h1>
      <p className="text-sm text-neutral-500 mb-6">Products you've saved for later.</p>

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      ) : wishlisted.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-neutral-200 rounded-2xl">
          <Heart className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">Nothing saved yet — tap the heart on any product to add it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {wishlisted.map((product, i) => (
            <ProductCard key={product.id} product={product} categoryName={categoryName(product.categoryId)} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
