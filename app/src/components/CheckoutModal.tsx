import { useState, useEffect, useRef, useCallback } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { trpc } from "@/providers/trpc";
import {
  X,
  CreditCard,
  Banknote,
  Upload,
  Check,
  Loader2,
  AlertTriangle,
} from "lucide-react";

const CEBU_CITIES = [
  "Cebu City",
  "Mandaue City",
  "Lapu-Lapu City",
  "Talisay City",
  "Bogo City",
  "Carcar City",
  "Liloan",
  "Consolacion",
  "Minglanilla",
  "Naga",
  "San Fernando",
  "Danao City",
  "Toledo City",
  "Balamban",
  "Asturias",
  "Compostela",
  "Cordova",
  "Other (specify in notes)",
];

const SHIPPING_FEES: Record<string, number> = {
  "Cebu City": 80,
  "Mandaue City": 80,
  "Lapu-Lapu City": 120,
  "Talisay City": 100,
  "Bogo City": 180,
  "Carcar City": 150,
  Liloan: 100,
  Consolacion: 90,
  Minglanilla: 120,
  Naga: 150,
  "San Fernando": 160,
  "Danao City": 160,
  "Toledo City": 180,
  Balamban: 200,
  Asturias: 200,
  Compostela: 120,
  Cordova: 130,
};

export default function CheckoutModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, subtotal, clearCart } = useCart();
  const { showToast } = useToast();

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "gcash">("cod");
  const [gcashRef, setGcashRef] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [agreed, setAgreed] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const createOrder = trpc.order.create.useMutation({
    onSuccess: (data) => {
      showToast(`Order placed! Order ID: ${data.orderId}`);
      clearCart();
      setIsOpen(false);
      resetForm();
    },
    onError: (err) => {
      showToast(err.message || "Failed to place order", "error");
    },
  });

  const resetForm = () => {
    setFullName("");
    setPhone("");
    setEmail("");
    setCity("");
    setAddressDetail("");
    setDeliveryNotes("");
    setPaymentMethod("cod");
    setGcashRef("");
    setReceiptImage(undefined);
    setAgreed(false);
  };

  const shippingFee = city ? (SHIPPING_FEES[city] || 150) : 0;
  const total = subtotal + shippingFee;

  // Listen for open-checkout event
  useEffect(() => {
    const handleOpen = () => {
      if (items.length === 0) {
        showToast("Your cart is empty", "error");
        return;
      }
      setIsOpen(true);
    };
    window.addEventListener("open-checkout", handleOpen);
    return () => window.removeEventListener("open-checkout", handleOpen);
  }, [items.length, showToast]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    []
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    []
  );

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("File too large. Max 5MB", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setReceiptImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showToast("Please enter your full name", "error");
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      showToast("Please enter a valid mobile number", "error");
      return;
    }
    if (!city) {
      showToast("Please select your city/municipality", "error");
      return;
    }
    if (paymentMethod === "gcash") {
      if (!gcashRef || gcashRef.length !== 13 || !/^\d{13}$/.test(gcashRef)) {
        showToast("Please enter a valid 13-digit GCash reference number", "error");
        return;
      }
      if (!receiptImage) {
        showToast("Please upload your GCash receipt screenshot", "error");
        return;
      }
    }
    if (!agreed) {
      showToast("Please confirm your order details", "error");
      return;
    }

    createOrder.mutate({
      customerName: fullName,
      phone,
      email: email || undefined,
      city,
      addressDetail: addressDetail || undefined,
      deliveryNotes: deliveryNotes || undefined,
      paymentMethod,
      gcashRefNumber: paymentMethod === "gcash" ? gcashRef : undefined,
      receiptImage: paymentMethod === "gcash" ? receiptImage : undefined,
      items: items.map((i) => ({
        productId: i.productId,
        productName: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      subtotal,
      shippingFee,
      total,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[2100] w-full md:w-[600px] md:max-h-[90vh] bg-[#1C1917] border border-[rgba(168,162,158,0.15)] rounded-xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(168,162,158,0.15)] shrink-0">
          <h2 className="text-lg font-semibold text-[#FAFAF9]">Checkout</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A8A29E] hover:text-[#FAFAF9] hover:bg-[rgba(168,162,158,0.1)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-5"
        >
          {/* Order Summary */}
          <div className="rounded-lg border border-[rgba(168,162,158,0.15)] bg-[rgba(28,25,23,0.4)] p-4">
            <h3 className="text-sm font-medium text-[#FAFAF9] mb-3">
              Order Summary ({items.length} item{items.length !== 1 ? "s" : ""})
            </h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between text-sm"
                >
                  <span className="text-[#A8A29E]">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="text-[#FAFAF9]">
                    ₱{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-[rgba(168,162,158,0.15)] flex justify-between">
              <span className="text-sm text-[#A8A29E]">Subtotal</span>
              <span className="text-sm font-semibold text-[#FAFAF9]">
                ₱{subtotal.toLocaleString()}
              </span>
            </div>
            {city && (
              <div className="mt-1 flex justify-between">
                <span className="text-sm text-[#A8A29E]">
                  Shipping ({city})
                </span>
                <span className="text-sm font-semibold text-[#FAFAF9]">
                  ₱{shippingFee.toLocaleString()}
                </span>
              </div>
            )}
            <div className="mt-2 pt-2 border-t border-[rgba(168,162,158,0.15)] flex justify-between">
              <span className="text-base font-semibold text-[#FAFAF9]">
                Total
              </span>
              <span className="text-lg font-bold text-[#D97706]">
                ₱{total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <h3 className="text-sm font-medium text-[#FAFAF9] mb-3">
              Customer Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#A8A29E] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(168,162,158,0.15)] bg-[#0C0A09] px-4 py-2.5 text-sm text-[#FAFAF9] placeholder-[#78716C] focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 outline-none transition-all"
                  placeholder="Juan Dela Cruz"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#A8A29E] mb-1.5">
                  Active Mobile Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-lg border border-[rgba(168,162,158,0.15)] bg-[#0C0A09] px-4 py-2.5 text-sm text-[#FAFAF9] placeholder-[#78716C] focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 outline-none transition-all"
                  placeholder="09XX XXX XXXX"
                  maxLength={11}
                  required
                />
                <p className="mt-1 text-xs text-[#78716C] flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-[#F59E0B]" />
                  We will call to verify your order. Fake numbers will be
                  cancelled.
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#A8A29E] mb-1.5">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(168,162,158,0.15)] bg-[#0C0A09] px-4 py-2.5 text-sm text-[#FAFAF9] placeholder-[#78716C] focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 outline-none transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h3 className="text-sm font-medium text-[#FAFAF9] mb-3">
              Delivery Address
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#A8A29E] mb-1.5">
                  City / Municipality *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(168,162,158,0.15)] bg-[#0C0A09] px-4 py-2.5 text-sm text-[#FAFAF9] focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 outline-none transition-all appearance-none"
                  required
                >
                  <option value="" disabled>
                    Select your area
                  </option>
                  {CEBU_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#A8A29E] mb-1.5">
                  Specific Address / Barangay
                </label>
                <input
                  type="text"
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(168,162,158,0.15)] bg-[#0C0A09] px-4 py-2.5 text-sm text-[#FAFAF9] placeholder-[#78716C] focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 outline-none transition-all"
                  placeholder="Street, Barangay, Landmark"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#A8A29E] mb-1.5">
                  Delivery Notes
                </label>
                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-[rgba(168,162,158,0.15)] bg-[#0C0A09] px-4 py-2.5 text-sm text-[#FAFAF9] placeholder-[#78716C] focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 outline-none transition-all resize-none"
                  placeholder="Any special instructions..."
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="text-sm font-medium text-[#FAFAF9] mb-3">
              Payment Method
            </h3>
            <div className="space-y-2">
              {/* COD */}
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`w-full flex items-start gap-3 rounded-lg border p-4 text-left transition-all ${
                  paymentMethod === "cod"
                    ? "border-[#D97706] bg-[rgba(217,119,6,0.05)]"
                    : "border-[rgba(168,162,158,0.15)] bg-[#0C0A09]"
                }`}
              >
                <div
                  className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    paymentMethod === "cod"
                      ? "border-[#D97706]"
                      : "border-[rgba(168,162,158,0.3)]"
                  }`}
                >
                  {paymentMethod === "cod" && (
                    <div className="h-2.5 w-2.5 rounded-full bg-[#D97706]" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-[#D97706]" />
                    <span className="text-sm font-medium text-[#FAFAF9]">
                      Cash on Delivery (COD)
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#78716C]">
                    Pay cash upon arrival via J&T or Lalamove delivery
                  </p>
                </div>
              </button>

              {/* GCash */}
              <button
                type="button"
                onClick={() => setPaymentMethod("gcash")}
                className={`w-full flex items-start gap-3 rounded-lg border p-4 text-left transition-all ${
                  paymentMethod === "gcash"
                    ? "border-[#D97706] bg-[rgba(217,119,6,0.05)]"
                    : "border-[rgba(168,162,158,0.15)] bg-[#0C0A09]"
                }`}
              >
                <div
                  className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    paymentMethod === "gcash"
                      ? "border-[#D97706]"
                      : "border-[rgba(168,162,158,0.3)]"
                  }`}
                >
                  {paymentMethod === "gcash" && (
                    <div className="h-2.5 w-2.5 rounded-full bg-[#D97706]" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-[#D97706]" />
                    <span className="text-sm font-medium text-[#FAFAF9]">
                      GCash (Manual Transfer)
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#78716C]">
                    Scan QR code and upload receipt for verification
                  </p>
                </div>
              </button>
            </div>

            {/* GCash Details */}
            {paymentMethod === "gcash" && (
              <div className="mt-4 space-y-4 rounded-lg border border-[rgba(168,162,158,0.15)] bg-[#0C0A09] p-4">
                {/* QR Code Placeholder */}
                <div className="text-center">
                  <div className="mx-auto h-[180px] w-[180px] rounded-lg border border-[rgba(168,162,158,0.15)] bg-white p-3 flex items-center justify-center">
                    <div className="text-center">
                      <div className="grid grid-cols-5 gap-1 mb-2">
                        {Array.from({ length: 25 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-4 w-4 ${
                              [
                                0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21,
                                22, 23, 24, 6, 12, 18, 7, 11, 13, 16, 8, 17,
                              ].includes(i)
                                ? "bg-black"
                                : "bg-white"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-black font-medium">
                        GCash QR Code
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-[#A8A29E]">
                    Scan to pay with GCash
                  </p>
                  <p className="text-[10px] text-[#78716C]">
                    Account: Galvanize Egg Chickens
                  </p>
                </div>

                {/* GCash Ref Number */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#A8A29E] mb-1.5">
                    13-Digit GCash Reference Number *
                  </label>
                  <input
                    type="text"
                    value={gcashRef}
                    onChange={(e) =>
                      setGcashRef(e.target.value.replace(/\D/g, "").slice(0, 13))
                    }
                    maxLength={13}
                    className="w-full rounded-lg border border-[rgba(168,162,158,0.15)] bg-[#1C1917] px-4 py-2.5 text-sm text-[#FAFAF9] placeholder-[#78716C] focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 outline-none transition-all tracking-widest"
                    placeholder="1234 5678 9012 3"
                  />
                </div>

                {/* Receipt Upload */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#A8A29E] mb-1.5">
                    Upload GCash Receipt Screenshot *
                  </label>
                  <div
                    onDrop={handleFileDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all ${
                      dragOver
                        ? "border-[#D97706] bg-[rgba(217,119,6,0.05)]"
                        : receiptImage
                        ? "border-[#10B981] bg-[rgba(16,185,129,0.05)]"
                        : "border-[rgba(168,162,158,0.15)] hover:border-[#D97706]"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {receiptImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <Check className="h-8 w-8 text-[#10B981]" />
                        <p className="text-sm text-[#10B981]">
                          Receipt uploaded successfully
                        </p>
                        <img
                          src={receiptImage}
                          alt="Receipt"
                          className="mt-2 max-h-32 rounded-lg"
                        />
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-[#78716C] mx-auto mb-2" />
                        <p className="text-sm text-[#A8A29E]">
                          Drop file here or click to browse
                        </p>
                        <p className="text-xs text-[#78716C] mt-1">
                          Supports JPG, PNG (max 5MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Agreement */}
          <label className="flex items-start gap-3 cursor-pointer">
            <div
              className={`mt-0.5 h-[18px] w-[18px] rounded border flex items-center justify-center shrink-0 transition-colors ${
                agreed
                  ? "bg-[#D97706] border-[#D97706]"
                  : "border-[rgba(168,162,158,0.3)]"
              }`}
            >
              {agreed && <Check className="h-3 w-3 text-[#0C0A09]" />}
            </div>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="sr-only"
            />
            <span className="text-sm text-[#A8A29E] leading-relaxed">
              I confirm that my contact details are accurate and I agree to be
              contacted for order verification. I understand that providing false
              information may result in order cancellation.
            </span>
          </label>
        </form>

        {/* Footer - sticky */}
        <div className="border-t border-[rgba(168,162,158,0.15)] px-6 py-4 shrink-0">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={createOrder.isPending}
            className="w-full rounded-lg bg-[#D97706] py-3 text-sm font-semibold text-[#0C0A09] hover:bg-[#B45309] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {createOrder.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Place Order — ₱{total.toLocaleString()}
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
