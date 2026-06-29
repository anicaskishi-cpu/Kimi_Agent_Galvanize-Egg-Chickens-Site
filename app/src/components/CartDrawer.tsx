import { useCart } from "@/context/CartContext";
import { X, Minus, Plus, Trash2, ShoppingCart } from "lucide-react";

export default function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    isOpen,
    setIsOpen,
  } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[1500] bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[420px] z-[1600] bg-[#1C1917] border-l border-[rgba(168,162,158,0.15)] flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(168,162,158,0.15)]">
          <h2 className="text-lg font-semibold text-[#FAFAF9]">Your Cart</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A8A29E] hover:text-[#FAFAF9] hover:bg-[rgba(168,162,158,0.1)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="h-16 w-16 text-[#78716C] mb-4" />
              <p className="text-[#A8A29E] mb-2">Your cart is empty</p>
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-[#D97706] hover:text-[#F59E0B] transition-colors"
              >
                Start shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 rounded-lg border border-[rgba(168,162,158,0.15)] bg-[rgba(28,25,23,0.6)] p-3"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-12 w-12 rounded-lg object-cover shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#FAFAF9] truncate">
                      {item.name}
                    </p>
                    <p className="text-sm text-[#D97706] font-semibold">
                      ₱{item.price.toLocaleString()}
                    </p>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded border border-[rgba(168,162,158,0.15)] text-[#A8A29E] hover:border-[#D97706] hover:text-[#D97706] transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-10 text-center text-sm text-[#FAFAF9]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded border border-[rgba(168,162,158,0.15)] text-[#A8A29E] hover:border-[#D97706] hover:text-[#D97706] transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="self-start text-[#78716C] hover:text-[#EF4444] transition-colors shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[rgba(168,162,158,0.15)] px-6 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A8A29E]">Subtotal</span>
              <span className="text-lg font-bold text-[#FAFAF9]">
                ₱{subtotal.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-[#78716C]">
              Shipping calculated at checkout
            </p>
            <button
              onClick={() => {
                setIsOpen(false);
                // Dispatch custom event to open checkout
                window.dispatchEvent(new CustomEvent("open-checkout"));
              }}
              className="w-full rounded-lg bg-[#D97706] py-3 text-sm font-semibold text-[#0C0A09] hover:bg-[#B45309] transition-all"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
