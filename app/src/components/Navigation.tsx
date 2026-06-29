import { useState, useEffect } from "react";
import { ShoppingCart, Menu, X, Shield, LogOut, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setIsOpen, itemCount } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setMobileOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
        scrolled
          ? "bg-[#0C0A09]/90 backdrop-blur-xl border-b border-[rgba(168,162,158,0.15)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <button
          onClick={() => scrollToSection("hero")}
          className="text-sm font-bold tracking-[0.08em] text-[#FAFAF9] hover:text-[#D97706] transition-colors"
        >
          GALVANIZE
        </button>

        {/* Center Nav Links - Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {["products", "about", "contact"].map((section) => (
            <button
              key={section}
              onClick={() => scrollToSection(section)}
              className="text-sm font-medium tracking-[0.02em] text-[#A8A29E] hover:text-[#D97706] transition-colors capitalize"
            >
              {section}
            </button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Public Login Link (Visible only when not authenticated) */}
          {!user && (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-1.5 text-sm font-medium text-[#A8A29E] hover:text-[#D97706] transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Login</span>
            </button>
          )}

          {/* Admin Dashboard Access */}
          {isAdmin && (
            <button
              onClick={() => navigate("/admin")}
              className="hidden md:flex items-center gap-1.5 text-sm font-medium text-[#A8A29E] hover:text-[#D97706] transition-colors"
            >
              <Shield className="h-4 w-4" />
              Admin
            </button>
          )}

          {/* User Display Info */}
          {user && (
            <div className="hidden md:flex items-center gap-2 text-sm text-[#A8A29E]">
              <User className="h-4 w-4" />
              <span className="max-w-[80px] truncate">{user.name}</span>
            </div>
          )}

          {/* Logout Action */}
          {user && (
            <button
              onClick={logout}
              className="hidden md:flex items-center gap-1.5 text-sm text-[#78716C] hover:text-[#EF4444] transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}

          {/* Cart Toggle */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(168,162,158,0.15)] text-[#A8A29E] hover:border-[#D97706] hover:text-[#D97706] transition-all"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#D97706] px-1 text-[0.65rem] font-bold text-[#0C0A09]">
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex md:hidden h-10 w-10 items-center justify-center rounded-lg border border-[rgba(168,162,158,0.15)] text-[#A8A29E]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[rgba(168,162,158,0.15)] bg-[#0C0A09]/95 backdrop-blur-xl px-4 py-4 space-y-3">
          {["products", "about", "contact"].map((section) => (
            <button
              key={section}
              onClick={() => scrollToSection(section)}
              className="block w-full text-left text-sm font-medium text-[#A8A29E] hover:text-[#D97706] transition-colors capitalize py-2"
            >
              {section}
            </button>
          ))}
          
          {/* Mobile Login Link */}
          {!user && (
            <button
              onClick={() => { navigate("/login"); setMobileOpen(false); }}
              className="flex items-center gap-2 text-sm font-medium text-[#A8A29E] py-2 w-full text-left hover:text-[#D97706]"
            >
              <User className="h-4 w-4" />
              Login / Register
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => { navigate("/admin"); setMobileOpen(false); }}
              className="flex items-center gap-2 text-sm font-medium text-[#D97706] py-2 w-full text-left"
            >
              <Shield className="h-4 w-4" />
              Admin Dashboard
            </button>
          )}

          {user && (
            <button
              onClick={() => { logout(); setMobileOpen(false); }}
              className="flex items-center gap-2 text-sm text-[#EF4444] py-2 w-full text-left"
            >
              <LogOut className="h-4 w-4" />
              Logout ({user.name})
            </button>
          )}
        </div>
      )}
    </nav>
  );
}