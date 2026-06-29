import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import {
  Shield,
  LogOut,
  Package,
  Clock,
  TrendingUp,
  ShoppingBag,
  ChevronDown,
  Eye,
  MessageSquare,
  Bell,
  Loader2,
  ArrowLeft,
  X,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "pending_verification", label: "Pending Verification", color: "text-[#F59E0B] bg-[rgba(245,158,11,0.15)]" },
  { value: "packed", label: "Packed", color: "text-[#3B82F6] bg-[rgba(59,130,246,0.15)]" },
  { value: "shipped", label: "Shipped", color: "text-[#8B5CF6] bg-[rgba(139,92,246,0.15)]" },
  { value: "delivered", label: "Delivered", color: "text-[#10B981] bg-[rgba(16,185,129,0.15)]" },
  { value: "cancelled", label: "Cancelled/Bogus", color: "text-[#EF4444] bg-[rgba(239,68,68,0.15)]" },
];

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading, logout } = useAuth();
  const { showToast } = useToast();
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: "user" | "ai"; text: string}[]>([
    { role: "ai", text: "Hello! I'm your Galvanize AI assistant. Ask me anything about orders, revenue, or business insights." },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const prevOrderCount = useRef(0);
  // Audio chime for new orders

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/");
    }
  }, [authLoading, isAdmin, navigate]);

  // Admin stats
  const { data: stats, refetch: refetchStats } = trpc.admin.stats.useQuery(undefined, {
    enabled: isAdmin,
    refetchInterval: 5000,
  });

  // Orders with polling
  const { data: orders, refetch: refetchOrders } = trpc.order.list.useQuery(undefined, {
    enabled: isAdmin,
    refetchInterval: 5000,
  });

  // Update status mutation
  const updateStatus = trpc.order.updateStatus.useMutation({
    onSuccess: () => {
      showToast("Order status updated");
      refetchOrders();
      refetchStats();
    },
    onError: () => showToast("Failed to update status", "error"),
  });

  // Chat mutation
  const chatMutation = trpc.chat.adminInsight.useMutation({
    onSuccess: (data) => {
      setChatHistory((prev) => [...prev, { role: "ai", text: data.reply }]);
    },
    onError: () => {
      setChatHistory((prev) => [...prev, { role: "ai", text: "Sorry, I couldn't process your request. Please try again." }]);
    },
  });

  // Audio chime for new orders
  useEffect(() => {
    if (orders && orders.length > prevOrderCount.current && prevOrderCount.current > 0) {
      // Play notification sound
      const audio = new Audio();
      audio.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleR0NZKrk7rNsGgxJkNTsvXwkDk+L0O+0eyUOUIjN7LR7JQ5Ph8ztrH4lDU6GzOu0fSQNTYTM6bN+JA1Mgsnosn0kDUyByeiwhCQNS4DH56+BJQ1Kf8znrYIlDUl9y+apgCUNS3vL5KiAJQ1Jesrkpn8lDUl3yuWlfyUNSHbK5KV+JQ1Hdcrkon4lDUZzyuShfSUNRnLK46B+JQ1FcMnjnn4lDUVwyOOcfSUNRHDH45t8lDURvv+OZfJQ1EL3xjnXyVNQ+u/E9dPNW1Dyz8Tt081bUPrHwOnTyWNQ8r+85dPFY1Duu7zdz8VjUOaztN3TxWdQ5q+w2cvFa1Dis6zRs8lvUN6nqM2rxXNQ3qOkxafBd1Den5y9p72DUNqXlLWjvYtQ1pOUqZ+9k1DWk5Cpj72bUNaPiK2LvZ9Q1ouEpYO9o1DWi3ydf72rUNaLeJl7vatQ1otwmXe9r1DWi2yJc73DUNaLYIFvvdNQ1otceWO901DWi0xhY7vXUNaLPDlTu9tQ1osMKVO7z1DWivvhU7vTUNaC581Du89A1oLjvUO7v0DWgt9xO7u/QNaCz2Eru79Q1oLPUSu7r1DWgr9NC6ufUNaCrzz7q49g1oKvLOubf2DWgq8s25tfYNaCrxy7m09g1oKvHLubP2DWgq8cq5sfcNaCrwu7mw+A1oKu+6uLD4DWgq7rq4r/gNaCrtubiu+A1oKuuxuK33DWgq7K+4rPcNaCrspbit9w1oKuuquKz3DWgq6qa4qfcNaCrplrip9w1oKumSuKj3DWgq6Y64p/cNaCrpfrin9w1oKul6uKP4DWgq6Xa4ovgNaCrpVrih+A1oKulOuJ34DWgq6Tq4mfgNaCrpJriV+A1oKukiuJH4DWgq6PK4ifgNaCro4riF+A1oKuiiuIH4DWgq6JK4efgNaCrokegZ+A1oKuiJ6BH4DWgq6HngEfgNaCroceAR+A1oKuhZ4An4DWgq6EngCfgNaCroLeAJ+A1oKugp4AX4DWgq6CHgBfgNaCrnweAF+A1oKudB4AX4DWgq5zHgBfgNaCrnIeAF+A1oKuYZ4AX4DWgq5gngBfgNaCrl+eAF+A1oKuXx4AX4DWgq5cHgBfgNaCrlseAF+A1oKuWZ4AX4DWgq5UngBfgNaCrlCeAF+A1oKuTp4AX4DWgq5MngBfgNaCrkqeAF+A1oKuQp4AX4DWgq48ngBfgNaCrjqOAF+A1oKuNo4AX4DWgq40jgBfgNaCrjKOAF+A1oKuLo4AX4DWgq4qjgBfgNaCriKOAF+A1oKuHo4AX4DWgq4ajgBfgNaCrf+OAF+A1oKt2o4AX4DWgq3WjgBfgNaCrdKOAF+A1oKt0o4AX4DWgq3OjgBfgNaCrbaOAF+A1oKtlY4AX4DWgq2TjgBfgNaCrZKOAF+A1oKtjo4AX4DWgq2KjgBfgNaCrYqOAF+A1oKtiY4AX4DWgq2EjgBfgNaCrXyOAF+A1oK1cjgBfgNaCrVSOAF+A1oK1MjgBfgNaCrUSOAF+A1oK1AjgBfgNaCrTwOAF+A1oKs+44AX4DWgqz7jgBfgNaCrOuOAF+A1oKsy44AX4DWgqzHjgBfgNaCrMeOAF+A1oKsx44AX4DWgqzDjgBfgNaCrL+OAF+A1oKsvo4AX4DWgqy7jgBfgNaCrLeOAF+A1oKsto4AX4DWgqy1jgBfgNaCrLKOAF+A1oKssY4AX4DWgqyvjgBfgNaCrK6OAF+A1oKsqo4AX4DWgqymjgBfgNaCrKWOAF+A1oKsno4AX4DWgqydjgBfgNaCrJ2OAF+A1oKsXY4AX4DWgqxdjgBfgNaCrF2OAF+A1oKsVY4AX4DWgqxdTgBfgNaCrFlOAF+A1oKsUU4AX4DWgqw/TgBfgNaCrD9OAF+A1oKsP04AX4DWgqw9TgBfgNaCrD1OAF+A1oKsO04AX4DWgqw5TgBfgNaCrDlOAF+A1oKsN04AX4DWgqwzTgBfgNaCrDFOAF+A1oKr/04AX4DWgqv/TgBfgNaCq/9OAF+A1oKr/04AX4DWgqv+TgBfgNaCq/1OAF+A1oKr/9OAF+A1oKr/04AX4DWgqv/TgBfgNaCq/9OAF+A1oKr/04AX4DWgqvzTgBfgNaCq/NOAF+A1oKr844AX4DWgqvzjgBfgNaCq/OOAF+A1oKr844AX4DWgqvzjgBfgNaCq/OOAF+A1oKr844AX4DWgqvzTgBfgNaCq/NOAF+A1oKr844AX4DWgqvzjgBfgNaCq/OOAF+A1oKr844AX4DWgqvzjgBfgNaCq/OOAF+A1oKr844AX4DWgqvzjgBfgNaCq/OOAF+A1oKr844AX4DWgqvzTgBfgNaCq/NOAF+A1oKr844AX4DWgqvzjgBfgNaCq/OOAF+A1oKr844AX4DWgqvzTgBfgNaCq/NOAF+A1oKr844AX4DWgqvzjgBfgNaCq/OOAF+A1oKr844AX4DWgqvzjgBfgNaCq/OOAF+A1oKr844AX4DWgqvzjgBfgNaCq/OOAF+A1oKr844AX4DWgqvzjgBfgNaCq/OOAF+A1oKr844AX4DWgqvzjgBfgNaCq/OOAF+A1oKr844AX4DWgqvzjgBfgNaCq/OOAF+A1oKr844AX4DWgqvzjgBfgNaCq/OOAF+A1oKr844AX4DWgqvzjgBfgNaCq/OOAF+A1oKr844AX4DWg==";
      audio.play().catch(() => {});
      showToast("New order received!");
    }
    if (orders) {
      prevOrderCount.current = orders.length;
    }
  }, [orders, showToast]);

  const handleSendChat = () => {
    if (!chatMessage.trim()) return;
    setChatHistory((prev) => [...prev, { role: "user", text: chatMessage }]);
    chatMutation.mutate({ message: chatMessage });
    setChatMessage("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0F0E0D]">
        <Loader2 className="h-8 w-8 animate-spin text-[#D97706]" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#0F0E0D] text-[#FAFAF9]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[rgba(168,162,158,0.15)] bg-[#0F0E0D]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-sm text-[#A8A29E] hover:text-[#FAFAF9] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="h-6 w-px bg-[rgba(168,162,158,0.15)]" />
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#D97706]" />
                <span className="text-sm font-semibold">Admin Dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(168,162,158,0.15)] text-[#A8A29E] hover:text-[#D97706] hover:border-[#D97706] transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
              </button>
              <div className="h-6 w-px bg-[rgba(168,162,158,0.15)]" />
              <span className="text-sm text-[#A8A29E]">{user?.name}</span>
              <button
                onClick={logout}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(168,162,158,0.15)] text-[#A8A29E] hover:text-[#EF4444] hover:border-[#EF4444] transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-[rgba(168,162,158,0.15)] bg-[rgba(28,25,23,0.6)] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(217,119,6,0.15)]">
                <ShoppingBag className="h-5 w-5 text-[#D97706]" />
              </div>
              <span className="text-xs uppercase tracking-wider text-[#A8A29E]">
                Total Orders
              </span>
            </div>
            <p className="text-2xl font-bold text-[#FAFAF9]">
              {stats?.totalOrders ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-[rgba(168,162,158,0.15)] bg-[rgba(28,25,23,0.6)] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(245,158,11,0.15)]">
                <Clock className="h-5 w-5 text-[#F59E0B]" />
              </div>
              <span className="text-xs uppercase tracking-wider text-[#A8A29E]">
                Pending
              </span>
            </div>
            <p className="text-2xl font-bold text-[#FAFAF9]">
              {stats?.pendingOrders ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-[rgba(168,162,158,0.15)] bg-[rgba(28,25,23,0.6)] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(16,185,129,0.15)]">
                <Bell className="h-5 w-5 text-[#10B981]" />
              </div>
              <span className="text-xs uppercase tracking-wider text-[#A8A29E]">
                Today&apos;s Orders
              </span>
            </div>
            <p className="text-2xl font-bold text-[#FAFAF9]">
              {stats?.todayOrders ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-[rgba(168,162,158,0.15)] bg-[rgba(28,25,23,0.6)] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(139,92,246,0.15)]">
                <TrendingUp className="h-5 w-5 text-[#8B5CF6]" />
              </div>
              <span className="text-xs uppercase tracking-wider text-[#A8A29E]">
                Total Revenue
              </span>
            </div>
            <p className="text-2xl font-bold text-[#FAFAF9]">
              ₱{(stats?.totalRevenue ?? 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="rounded-xl border border-[rgba(168,162,158,0.15)] bg-[rgba(28,25,23,0.6)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[rgba(168,162,158,0.15)] flex items-center justify-between">
            <h2 className="text-lg font-semibold">Orders</h2>
            <span className="text-xs text-[#78716C]">
              Auto-refreshes every 5s
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(168,162,158,0.15)] text-left">
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-[#A8A29E]">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-[#A8A29E]">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-[#A8A29E]">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-[#A8A29E]">
                    Address
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-[#A8A29E]">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-[#A8A29E]">
                    Total
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-[#A8A29E]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-[#A8A29E]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders && orders.length > 0 ? (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-[rgba(168,162,158,0.08)] hover:bg-[rgba(168,162,158,0.05)] transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-[#FAFAF9]">
                        {order.orderId}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#A8A29E]">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#A8A29E]">
                        {order.phone}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#A8A29E] max-w-[150px] truncate">
                        {order.city}
                        {order.addressDetail
                          ? ` — ${order.addressDetail}`
                          : ""}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-medium uppercase ${
                              order.paymentMethod === "gcash"
                                ? "text-[#8B5CF6]"
                                : "text-[#10B981]"
                            }`}
                          >
                            {order.paymentMethod}
                          </span>
                          {order.paymentMethod === "gcash" &&
                            order.receiptImage && (
                              <button
                                onClick={() =>
                                  setSelectedReceipt(order.receiptImage)
                                }
                                className="flex items-center gap-1 text-xs text-[#D97706] hover:text-[#F59E0B] transition-colors"
                              >
                                <Eye className="h-3 w-3" />
                                Receipt
                              </button>
                            )}
                        </div>
                        {order.gcashRefNumber && (
                          <p className="text-[10px] text-[#78716C] mt-0.5">
                            Ref: {order.gcashRefNumber}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#D97706]">
                        ₱{Number(order.total).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateStatus.mutate({
                                id: order.id,
                                status: e.target.value as
                                  | "pending_verification"
                                  | "packed"
                                  | "shipped"
                                  | "delivered"
                                  | "cancelled",
                              })
                            }
                            className={`appearance-none rounded-full px-3 py-1 text-xs font-medium pr-7 cursor-pointer ${
                              STATUS_OPTIONS.find(
                                (s) => s.value === order.status
                              )?.color || ""
                            }`}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none text-current opacity-50" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            const items = order.items
                              ?.map(
                                (i) =>
                                  `${i.productName} x${i.quantity}`
                              )
                              .join(", ");
                            alert(
                              `Order: ${order.orderId}\nCustomer: ${order.customerName}\nPhone: ${order.phone}\nAddress: ${order.city}${order.addressDetail ? ` — ${order.addressDetail}` : ""}\n\nItems: ${items}\nTotal: ₱${Number(order.total).toLocaleString()}`
                            );
                          }}
                          className="text-xs text-[#A8A29E] hover:text-[#D97706] transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-sm text-[#78716C]"
                    >
                      <Package className="h-10 w-10 mx-auto mb-3 text-[#78716C]" />
                      No orders yet. New orders will appear here automatically.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div
          className="fixed inset-0 z-[3000] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedReceipt(null)}
        >
          <div className="relative max-w-lg w-full">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute -top-10 right-0 text-[#A8A29E] hover:text-[#FAFAF9]"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={selectedReceipt}
              alt="GCash Receipt"
              className="w-full rounded-lg"
            />
          </div>
        </div>
      )}

      {/* AI Chat */}
      {chatOpen && (
        <div className="fixed bottom-4 right-4 z-[2500] w-[380px] max-h-[500px] bg-[#1C1917] border border-[rgba(168,162,158,0.15)] rounded-xl flex flex-col shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(168,162,158,0.15)]">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#D97706]" />
              <span className="text-sm font-medium">Galvanize AI</span>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-[#78716C] hover:text-[#FAFAF9]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[350px]">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-[#D97706] text-[#0C0A09]"
                      : "bg-[rgba(168,162,158,0.1)] text-[#A8A29E]"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-[rgba(168,162,158,0.1)] rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#D97706]" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-[rgba(168,162,158,0.15)] p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                placeholder="Ask about orders..."
                className="flex-1 rounded-lg border border-[rgba(168,162,158,0.15)] bg-[#0C0A09] px-3 py-2 text-sm text-[#FAFAF9] placeholder-[#78716C] focus:border-[#D97706] outline-none"
              />
              <button
                onClick={handleSendChat}
                disabled={chatMutation.isPending || !chatMessage.trim()}
                className="rounded-lg bg-[#D97706] px-3 py-2 text-[#0C0A09] hover:bg-[#B45309] transition-colors disabled:opacity-50"
              >
                <MessageSquare className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
