import { useState, useEffect, useRef } from "react";
import { trpc } from "@/providers/trpc";
import { useToast } from "@/context/ToastContext";
import { Phone, Mail, MapPin, Send, MessageSquare, Loader2 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const { showToast } = useToast();
  const utils = trpc.useUtils();
  const sectionRef = useRef<HTMLElement>(null);

  const createMessage = trpc.message.create.useMutation({
    onSuccess: () => {
      showToast("Message posted successfully!");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      utils.message.list.invalidate();
    },
    onError: () => {
      showToast("Failed to post message", "error");
    },
  });

  const { data: messages, isLoading: messagesLoading } =
    trpc.message.list.useQuery();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    createMessage.mutate({ name, email, phone: phone || undefined, content: message });
  };

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".contact-heading", {
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

      gsap.from(".contact-form", {
        scrollTrigger: {
          trigger: ".contact-form",
          start: "top 85%",
          toggleActions: "play none none none",
        },
        x: -30,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      });

      gsap.from(".message-board", {
        scrollTrigger: {
          trigger: ".message-board",
          start: "top 85%",
          toggleActions: "play none none none",
        },
        x: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative z-20 bg-[#0C0A09] py-24 border-t border-[rgba(168,162,158,0.15)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="contact-heading text-center mb-16">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D97706] mb-3">
            Get in Touch
          </p>
          <h2
            className="font-bold text-[#FAFAF9] tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
          >
            Contact & Message Board
          </h2>
          <p className="mt-4 text-[#A8A29E] max-w-lg mx-auto">
            Have questions or want to share your experience? Reach out directly
            or leave a message on our community board.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="contact-form space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="h-5 w-5 text-[#D97706]" />
              <span className="text-[#A8A29E]">Cebu City, Philippines</span>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <Phone className="h-5 w-5 text-[#D97706]" />
              <span className="text-[#A8A29E]">+63 912 345 6789</span>
            </div>
            <div className="flex items-center gap-3 mb-8">
              <Mail className="h-5 w-5 text-[#D97706]" />
              <span className="text-[#A8A29E]">hello@galvanize.ph</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#A8A29E] mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(168,162,158,0.15)] bg-[#1C1917] px-4 py-3 text-[#FAFAF9] placeholder-[#78716C] focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 outline-none transition-all"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#A8A29E] mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(168,162,158,0.15)] bg-[#1C1917] px-4 py-3 text-[#FAFAF9] placeholder-[#78716C] focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 outline-none transition-all"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#A8A29E] mb-2">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(168,162,158,0.15)] bg-[#1C1917] px-4 py-3 text-[#FAFAF9] placeholder-[#78716C] focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 outline-none transition-all"
                  placeholder="+63 9XX XXX XXXX"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#A8A29E] mb-2">
                  Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-[rgba(168,162,158,0.15)] bg-[#1C1917] px-4 py-3 text-[#FAFAF9] placeholder-[#78716C] focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 outline-none transition-all resize-none"
                  placeholder="Write your message..."
                />
              </div>
              <button
                type="submit"
                disabled={createMessage.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D97706] py-3 text-sm font-semibold text-[#0C0A09] hover:bg-[#B45309] transition-all disabled:opacity-50"
              >
                {createMessage.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Post Message
              </button>
            </form>
          </div>

          {/* Message Board */}
          <div className="message-board">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="h-5 w-5 text-[#D97706]" />
              <h3 className="text-lg font-semibold text-[#FAFAF9]">
                Community Messages
              </h3>
            </div>

            {messagesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#D97706]" />
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-lg border border-[rgba(168,162,158,0.15)] bg-[rgba(28,25,23,0.4)] p-4 hover:border-[rgba(217,119,6,0.2)] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#FAFAF9]">
                        {msg.name}
                      </span>
                      <span className="text-xs text-[#78716C]">
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleDateString("en-PH")
                          : ""}
                      </span>
                    </div>
                    <p className="text-sm text-[#A8A29E] leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-[rgba(168,162,158,0.15)] rounded-lg">
                <MessageSquare className="h-10 w-10 text-[#78716C] mx-auto mb-3" />
                <p className="text-sm text-[#A8A29E]">
                  No messages yet. Be the first to post!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
