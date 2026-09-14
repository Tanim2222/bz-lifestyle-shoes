import { useState } from "react";
import { Heart, ShoppingBag, Check } from "lucide-react";
import type { Product } from "../../admin/types";
import { useCart } from "../../context/CartContext";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { useWishlist } from "../../context/WishlistContext";

function formatPeso(value: number): string {
  return `₱${value.toLocaleString("en-PH")}`;
}

export default function ProductCard({ product, categoryName }: { product: Product; categoryName: string; index?: number }) {
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCart();
  const { customer, openAuthModal } = useCustomerAuth();
  const { isWishlisted, toggle } = useWishlist();
  const liked = isWishlisted(product.id);
  const onSale = product.compareAtPrice !== null && product.compareAtPrice > product.price;

  const handleToggleWishlist = () => {
    if (!customer) {
      openAuthModal();
      return;
    }
    toggle(product.id);
  };

  const handleAddToCart = () => {
    const variant = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
    if (!variant) return;
    addItem({
      productId: product.id,
      size: variant.size,
      name: product.name,
      colorway: product.colorway,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="group bg-white border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative bg-neutral-100 aspect-square flex items-center justify-center overflow-hidden">
        {onSale && (
          <span className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide bg-red-500 text-white">
            SALE
          </span>
        )}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200 flex items-center justify-center cursor-pointer z-10 transition-transform hover:scale-110"
          aria-label="Add to wishlist"
        >
          <Heart className={`w-4 h-4 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-neutral-500"}`} />
        </button>
        <img
          src={product.imageUrl}
          alt={`${product.name} ${product.colorway}`}
          className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-300"
          style={{ filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.15))" }}
          draggable={false}
        />
        <button
          onClick={handleAddToCart}
          className="absolute bottom-0 left-0 right-0 py-2.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer hover:bg-neutral-800 transition-colors"
        >
          {justAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
          {justAdded ? "Added" : "Add to Cart"}
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-baseline gap-2">
          <p className={`text-sm font-bold ${onSale ? "text-red-600" : "text-neutral-900"}`}>{formatPeso(product.price)}</p>
          {onSale && <p className="text-xs text-neutral-400 line-through">{formatPeso(product.compareAtPrice!)}</p>}
        </div>
        <p className="text-sm text-neutral-600">
          {product.name} {product.colorway}
        </p>
        <p className="text-xs text-teal-600">{categoryName}</p>
      </div>
    </div>
  );
}
