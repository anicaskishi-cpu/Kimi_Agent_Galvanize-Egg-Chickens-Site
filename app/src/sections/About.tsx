import { useEffect, useRef } from "react";
import { MapPin, Truck, Shield, Clock } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: Shield,
    title: "Rust-Resistant",
    desc: "Hot-dip galvanized coating protects against corrosion in humid tropical climates.",
  },
  {
    icon: Truck,
    title: "Island-Wide Delivery",
    desc: "We deliver across Cebu and neighboring islands via J&T, Lalamove, and local couriers.",
  },
  {
    icon: Clock,
    title: "Built to Last",
    desc: "Every weld inspected, every joint reinforced. Our cages outlast the competition by years.",
  },
  {
    icon: MapPin,
    title: "Cebu-Based",
    desc: "Proudly designed and fabricated locally, supporting Cebuano craftsmen and families.",
  },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".about-heading", {
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

      gsap.from(".about-image", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
        x: -30,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      });

      gsap.from(".about-feature", {
        scrollTrigger: {
          trigger: ".about-features",
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
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative z-20 bg-[#0C0A09] py-24 border-t border-[rgba(168,162,158,0.15)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="about-heading text-center mb-16">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D97706] mb-3">
            Why Choose Us
          </p>
          <h2
            className="font-bold text-[#FAFAF9] tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
          >
            Crafted in Cebu, Built to Endure
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Image */}
          <div className="about-image relative rounded-xl overflow-hidden">
            <img
              src="/about/workshop.jpg"
              alt="Cebu workshop crafting galvanized cages"
              className="w-full h-[300px] lg:h-[400px] object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09]/60 to-transparent" />
          </div>

          {/* Text */}
          <div className="space-y-6">
            <p className="text-[#A8A29E] leading-relaxed text-lg">
              Galvanize Egg Chickens is a Cebu-based family business that has been
              crafting premium galvanized poultry equipment for over a decade.
              Every cage that leaves our workshop carries the mark of meticulous
              Cebuano craftsmanship.
            </p>
            <p className="text-[#A8A29E] leading-relaxed">
              We understand the unique challenges of poultry farming in the
              Philippines — from tropical humidity to monsoon seasons. That is why
              we use only heavy-gauge steel with hot-dip galvanization, ensuring
              our cages resist rust and corrosion year after year.
            </p>
            <p className="text-[#A8A29E] leading-relaxed">
              Whether you are a backyard enthusiast with a few layers or a
              commercial operation with thousands of birds, we have the right
              cage system for your needs. Our designs prioritize bird welfare,
              egg cleanliness, and farmer convenience.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="about-features grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="about-feature rounded-xl border border-[rgba(168,162,158,0.15)] bg-[rgba(28,25,23,0.4)] p-6 hover:border-[rgba(217,119,6,0.3)] transition-colors"
            >
              <feature.icon className="h-8 w-8 text-[#D97706] mb-4" />
              <h3 className="text-base font-semibold text-[#FAFAF9] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[#A8A29E] leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
