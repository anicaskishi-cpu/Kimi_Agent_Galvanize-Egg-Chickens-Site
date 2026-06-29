import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

const BADGE_STYLES: Record<string, string> = {
  "best-seller": "bg-[rgba(217,119,6,0.15)] text-[#D97706] border-[rgba(217,119,6,0.3)]",
  "new-arrival": "bg-[rgba(16,185,129,0.15)] text-[#10B981] border-[rgba(16,185,129,0.3)]",
  "out-of-stock": "bg-[rgba(239,68,68,0.15)] text-[#EF4444] border-[rgba(239,68,68,0.3)]",
  "pre-order": "bg-[rgba(245,158,11,0.15)] text-[#F59E0B] border-[rgba(245,158,11,0.3)]",
};

const BADGE_LABELS: Record<string, string> = {
  "best-seller": "Best Seller",
  "new-arrival": "New Arrival",
  "out-of-stock": "Out of Stock",
  "pre-order": "Pre-Order Available",
};

type ProductCardProps = {
  product: {
    id: number;
    name: string;
    slug: string;
    shortDesc: string | null;
    price: string;
    image: string | null;
    badge: string | null;
    inStock: boolean;
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      image: product.image || "",
      badge: product.badge,
    });
    showToast(`Added "${product.name}" to cart`);
  };

  return (
    <article className="group relative rounded-xl border border-[rgba(168,162,158,0.15)] bg-[rgba(28,25,23,0.6)] backdrop-blur-xl overflow-hidden glow-card">
      {/* Badge */}
      {product.badge && (
        <span
          className={`absolute top-3 left-3 z-10 rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider ${
            BADGE_STYLES[product.badge] || ""
          }`}
        >
          {BADGE_LABELS[product.badge] || product.badge}
        </span>
      )}

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.image || ""}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-600 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1C1917]" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-[#FAFAF9] tracking-[-0.01em]">
          {product.name}
        </h3>

        <p className="mt-1 text-xl font-bold text-[#D97706]">
          ₱{Number(product.price).toLocaleString()}
        </p>

        {product.shortDesc && (
          <p className="mt-2 text-sm text-[#A8A29E] line-clamp-2 leading-relaxed">
            {product.shortDesc}
          </p>
        )}

        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
            product.inStock
              ? "bg-[#D97706] text-[#0C0A09] hover:bg-[#B45309] hover:-translate-y-0.5 shadow-lg shadow-[#D97706]/20"
              : "bg-[rgba(168,162,158,0.1)] text-[#78716C] cursor-not-allowed"
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </article>
  );
}
