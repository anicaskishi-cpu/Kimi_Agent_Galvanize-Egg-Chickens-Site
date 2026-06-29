import { trpc } from "@/providers/trpc";
import ProductCard from "@/components/ProductCard";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Products() {
  const { data: products, isLoading } = trpc.product.list.useQuery();
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !cardsRef.current || !products?.length) return;

    const ctx = gsap.context(() => {
      // Animate heading
      gsap.from(".products-heading", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      });

      // Stagger cards
      gsap.from(".product-card-wrapper", {
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [products]);

  return (
    <section
      id="products"
      ref={sectionRef}
      className="relative z-20 bg-[#0C0A09] py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="products-heading text-center mb-16">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D97706] mb-3">
            Our Collection
          </p>
          <h2
            className="font-bold text-[#FAFAF9] tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
          >
            Premium Galvanized Cages
          </h2>
          <p className="mt-4 text-[#A8A29E] max-w-lg mx-auto">
            Each cage is hand-welded in Cebu using heavy-gauge galvanized steel,
            designed for the tropical climate and rigors of daily farm use.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#D97706]" />
          </div>
        ) : (
          <div
            ref={cardsRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {products?.map((product) => (
              <div key={product.id} className="product-card-wrapper">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
