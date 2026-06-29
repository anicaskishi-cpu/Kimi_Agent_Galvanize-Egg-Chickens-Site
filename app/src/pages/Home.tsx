import Navigation from "@/components/Navigation";
import CartDrawer from "@/components/CartDrawer";
import CheckoutModal from "@/components/CheckoutModal";
import Hero from "@/sections/Hero";
import Products from "@/sections/Products";
import About from "@/sections/About";
import Contact from "@/sections/Contact";
import Footer from "@/sections/Footer";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";

export default function Home() {
  return (
    <CartProvider>
      <ToastProvider>
        <div className="min-h-screen bg-[#0C0A09]">
          <Navigation />
          <Hero />
          <Products />
          <About />
          <Contact />
          <Footer />
          <CartDrawer />
          <CheckoutModal />
        </div>
      </ToastProvider>
    </CartProvider>
  );
}
