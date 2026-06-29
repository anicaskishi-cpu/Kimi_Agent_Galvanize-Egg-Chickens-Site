import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".footer-col", {
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 90%",
          toggleActions: "play none none none",
        },
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer
      ref={footerRef}
      className="relative z-20 bg-[#1C1917] border-t border-[rgba(168,162,158,0.15)] pt-16 pb-8"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="footer-col">
            <h3 className="text-sm font-bold tracking-[0.08em] text-[#FAFAF9] mb-3">
              GALVANIZE
            </h3>
            <p className="text-sm text-[#A8A29E] leading-relaxed">
              Premium Poultry Equipment — Cebu, Philippines. Hand-crafted
              galvanized cages for every scale of poultry farming.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="text-xs font-medium uppercase tracking-[0.04em] text-[#A8A29E] mb-4">
              Quick Links
            </h4>
            <div className="space-y-2">
              {[
                { label: "Products", id: "products" },
                { label: "About", id: "about" },
                { label: "Contact", id: "contact" },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="block text-sm text-[#A8A29E] hover:text-[#D97706] transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="text-xs font-medium uppercase tracking-[0.04em] text-[#A8A29E] mb-4">
              Contact
            </h4>
            <div className="space-y-2 text-sm text-[#A8A29E]">
              <p>Cebu City, Philippines</p>
              <p>+63 912 345 6789</p>
              <p>hello@galvanize.ph</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[rgba(168,162,158,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#78716C]">
            &copy; 2025 Galvanize Egg Chickens. All rights reserved.
          </p>
          <p className="text-xs text-[#78716C]">
            Built by Venci Agustines
          </p>
        </div>
      </div>
    </footer>
  );
}
