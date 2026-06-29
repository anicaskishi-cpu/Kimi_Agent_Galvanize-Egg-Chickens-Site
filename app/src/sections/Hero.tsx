import { useEffect, useRef } from "react";
import { ArrowDown } from "lucide-react";
import * as THREE from "three";

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle river configuration
    const PARTICLE_COUNT = 2000;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    // Initialize particles along a sine-wave path
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = Math.random();
      const x = (t - 0.5) * 60;
      const waveY = Math.sin(t * Math.PI * 4) * 8;
      const waveZ = Math.cos(t * Math.PI * 3) * 4;

      positions[i * 3] = x + (Math.random() - 0.5) * 3;
      positions[i * 3 + 1] = waveY + (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = waveZ + (Math.random() - 0.5) * 4;

      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;

      // Larger particles at wave crests (clusters)
      const distFromCrest = Math.abs(waveY - Math.sin(t * Math.PI * 4) * 8);
      sizes[i] = distFromCrest < 2 ? 0.15 + Math.random() * 0.2 : 0.05 + Math.random() * 0.1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      color: new THREE.Color("#D97706"),
      size: 0.12,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Mouse interaction
    const mouse = { x: 0, y: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animation
    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const posArray = geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;

        // Flow along the wave path
        posArray[i3] += velocities[i3] + 0.01;
        posArray[i3 + 1] += velocities[i3 + 1] + Math.sin(elapsed * 0.5 + i * 0.01) * 0.002;
        posArray[i3 + 2] += velocities[i3 + 2];

        // Mouse repulsion
        const dx = posArray[i3] - mouse.x * 20;
        const dy = posArray[i3 + 1] - mouse.y * 10;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 5) {
          const force = (5 - dist) * 0.01;
          posArray[i3] += (dx / dist) * force;
          posArray[i3 + 1] += (dy / dist) * force;
        }

        // Wrap around
        if (posArray[i3] > 30) posArray[i3] = -30;
        if (posArray[i3] < -30) posArray[i3] = 30;
      }

      geometry.attributes.position.needsUpdate = true;

      // Gentle rotation
      points.rotation.y = Math.sin(elapsed * 0.1) * 0.05;
      points.rotation.x = Math.cos(elapsed * 0.08) * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden">
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />

      {/* Content Overlay */}
      <div
        className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center"
        style={{ pointerEvents: "none" }}
      >
        <p
          className="text-xs font-medium tracking-[0.2em] uppercase text-[#D97706] mb-4 animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          Premium Poultry Equipment — Cebu, Philippines
        </p>

        <h1
          className="font-bold text-[#FAFAF9] leading-[1.1] tracking-[-0.02em] max-w-4xl"
          style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            textShadow: "0 2px 30px rgba(0,0,0,0.5)",
          }}
        >
          Galvanized Chicken Cages Built to{" "}
          <span className="text-gradient">Last a Lifetime</span>
        </h1>

        <p
          className="mt-6 text-lg text-[#A8A29E] max-w-xl leading-relaxed"
          style={{ textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}
        >
          Crafted for Cebu poultry farmers and breeders. From backyard coops to
          commercial farms, our cages deliver durability, hygiene, and maximum
          egg production efficiency.
        </p>

        <button
          onClick={scrollToProducts}
          className="mt-8 pointer-events-auto inline-flex items-center gap-2 rounded-lg bg-[#D97706] px-6 py-3 text-sm font-semibold text-[#0C0A09] hover:bg-[#B45309] hover:-translate-y-0.5 transition-all shadow-lg shadow-[#D97706]/20"
        >
          Shop Now
        </button>

        {/* Scroll indicator */}
        <button
          onClick={scrollToProducts}
          className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#78716C] hover:text-[#D97706] transition-colors"
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </button>
      </div>
    </section>
  );
}
