import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Check, Download, Printer, ChevronRight, Star,
  X, ArrowRight, Shield, Phone, MessageCircle,
} from "lucide-react";
import { getOrders, type StoredOrder } from "../utils/orderStorage";
import { ALL_POOJAS } from "../data/pujaData";

// ─── FURTHER STEPS TIMELINE ──────────────────────────────────────────────────

const TIMELINE = [
  {
    icon: "✅",
    title: "Booking Confirmed",
    timing: "Right Now",
    desc: "Your booking is confirmed and a confirmation email has been sent to your inbox.",
    done: true,
  },
  {
    icon: "🤝",
    title: "iMeUsWe Accepts",
    timing: "Within 2 hours",
    desc: "Our coordinator reviews your Sankalp details and confirms the puja schedule with you.",
    done: false,
  },
  {
    icon: "📦",
    title: "Samagri Preparation",
    timing: "24 hours before",
    desc: "Ritual materials (Samagri) are prepared fresh at the iMeUsWe Puja Center, Bengaluru.",
    done: false,
  },
  {
    icon: "📹",
    title: "Livestream Link Sent",
    timing: "12 hours before",
    desc: "Your live stream link is sent to your registered email and mobile number.",
    done: false,
  },
  {
    icon: "🙏",
    title: "Puja Performed",
    timing: "On scheduled date",
    desc: "The ritual is performed at the Bengaluru iMeUsWe Puja Center by our qualified priests.",
    done: false,
  },
  {
    icon: "📬",
    title: "Prasad & Certificate",
    timing: "After the puja",
    desc: "Prasad is dispatched via courier and your digital puja certificate is emailed to you.",
    done: false,
  },
];

const METHOD_LABELS: Record<string, string> = {
  upi: "UPI",
  card: "Debit / Credit Card",
  netbanking: "Net Banking",
  wallet: "iMeUsWe Wallet",
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function InvoicePage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Read booking data — from navigation state or fallback to first localStorage order
  const order: StoredOrder | null =
    (location.state as StoredOrder | null) ?? getOrders()[0] ?? null;

  // Success banner state
  const [showBanner, setShowBanner] = useState(true);
  const [bannerExiting, setBannerExiting] = useState(false);
  const [bannerProgress, setBannerProgress] = useState(100);

  useEffect(() => {
    if (!showBanner) return;
    const exitTimer = setTimeout(() => setBannerExiting(true), 4200);
    const hideTimer = setTimeout(() => setShowBanner(false), 5000);
    const tick = setInterval(() => {
      setBannerProgress((p) => Math.max(0, p - 2));
    }, 100);
    return () => { clearTimeout(exitTimer); clearTimeout(hideTimer); clearInterval(tick); };
  }, [showBanner]);

  // Recommended pujas — exclude the current one
  const recommended = ALL_POOJAS.filter(
    (p) => p.name !== order?.pujaName && !p.isInstant
  ).slice(0, 3);

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: "#F8F7FA" }}>
        <div className="text-center px-4">
          <div className="text-5xl mb-4">🙏</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">No Booking Found</h2>
          <p className="text-sm text-gray-500 mb-6">Complete a puja booking to view your invoice here.</p>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ backgroundColor: "#E77237" }}
          >
            Browse Pujas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#F8F7FA", fontFamily: "'Public Sans', sans-serif", minHeight: "100vh" }}>

      {/* ── SUCCESS BANNER ──────────────────────────────────────────────── */}
      {showBanner && (
        <div
          className="fixed left-0 right-0 z-50 overflow-hidden transition-all duration-700"
          style={{
            top: "64px",
            transform: bannerExiting ? "translateY(-108%)" : "translateY(0)",
            opacity: bannerExiting ? 0 : 1,
          }}
        >
          <div className="relative" style={{ backgroundColor: "#059669" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  <Check size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">🎉 Puja Booked Successfully!</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.8)" }}>
                    Booking confirmed · Order {order.orderId} · ₹{order.total.toLocaleString("en-IN")} paid
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setBannerExiting(true); setTimeout(() => setShowBanner(false), 600); }}
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                <X size={14} className="text-white" />
              </button>
            </div>
            {/* Progress bar */}
            <div
              className="absolute bottom-0 left-0 h-0.5 transition-all ease-linear"
              style={{ width: `${bannerProgress}%`, backgroundColor: "rgba(255,255,255,0.6)", transitionDuration: "100ms" }}
            />
          </div>
        </div>
      )}

      <div
        className="max-w-5xl mx-auto px-4 sm:px-6 py-8"
        style={{ paddingTop: showBanner ? "4.5rem" : "2rem", transition: "padding-top 0.7s" }}
      >

        {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs px-2.5 py-1 rounded-full font-semibold text-white flex items-center gap-1"
                style={{ backgroundColor: "#059669" }}
              >
                <Check size={11} /> Confirmed
              </span>
              <span className="text-xs text-gray-400">· Order {order.orderId}</span>
            </div>
            <h1 style={{ color: "#1C1917", fontSize: "1.5rem", fontWeight: 700 }}>
              Booking Invoice
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>
              Booked on {new Date(order.bookingTimestamp).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · iMeUsWe Puja
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-gray-50"
              style={{ borderColor: "#E5E7EB", color: "#374151" }}
            >
              <Printer size={14} /> Print
            </button>
            <button
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-white transition-all"
              style={{ backgroundColor: "#E77237" }}
            >
              <Download size={14} /> Download PDF
            </button>
          </div>
        </div>

        {/* ── INVOICE CARD ─────────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl border overflow-hidden mb-6"
          style={{ borderColor: "#FBCFB8", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
        >
          {/* Invoice header strip */}
          <div
            className="px-6 py-5 flex items-center justify-between gap-4 flex-wrap"
            style={{ backgroundColor: "#1C0A00" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
              >
                🕉️
              </div>
              <div>
                <p className="text-white font-bold">iMeUsWe Puja</p>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.75rem" }}>Sacred Rituals, Pure Faith</p>
              </div>
            </div>
            <div className="text-right">
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.7rem", letterSpacing: "0.08em" }} className="uppercase">Invoice</p>
              <p className="text-white font-bold">{order.orderId}</p>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.7rem" }}>
                {new Date(order.bookingTimestamp).toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>

          {/* Invoice body — 2 columns on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: "#FEF3C7" }}>

            {/* Left: Puja Details */}
            <div className="p-5 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#C05621" }}>
                  🛕 Puja Details
                </p>
                <div className="space-y-2.5">
                  <DetailRow label="Puja" value={order.pujaName} highlight />
                  <DetailRow label="Package" value={order.packageName} />
                  <DetailRow label="Date" value={order.date} />
                  <DetailRow label="Time" value={order.time} />
                  <DetailRow label="Location" value="iMeUsWe Puja Center, Bengaluru" />
                  <DetailRow label="Devotee" value={order.devotee} />
                  {order.email && <DetailRow label="Email" value={order.email} />}
                </div>
              </div>

              {/* Add-ons */}
              {order.addons.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: "#C05621" }}>
                    ✚ Add-ons
                  </p>
                  <div className="space-y-1.5">
                    {order.addons.map((a) => (
                      <div key={a} className="flex items-center gap-2 text-xs text-gray-700">
                        <Check size={11} style={{ color: "#059669" }} className="flex-shrink-0" />
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What's included */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: "#C05621" }}>
                  ✅ What's Included
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {["Sankalp recitation", "Navagraha Puja", "Live stream link", "Prasad dispatch", "Puja certificate", "Ritual recording"].map((item) => (
                    <div key={item} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Check size={10} style={{ color: "#059669" }} className="flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Payment Details */}
            <div className="p-5 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#C05621" }}>
                  💳 Payment Breakdown
                </p>
                <div className="space-y-2">
                  <PriceRow label={order.packageName} value={`₹${order.packagePrice.toLocaleString("en-IN")}`} />
                  {order.addonTotal > 0 && (
                    <PriceRow label="Add-ons" value={`₹${order.addonTotal.toLocaleString("en-IN")}`} />
                  )}
                  {order.couponDiscount > 0 && (
                    <PriceRow label="Coupon Discount" value={`−₹${order.couponDiscount.toLocaleString("en-IN")}`} isGreen />
                  )}
                  <div className="h-px my-1" style={{ backgroundColor: "#FEF3C7" }} />
                  <PriceRow label="Subtotal" value={`₹${(order.total - order.gst).toLocaleString("en-IN")}`} />
                  <PriceRow label="GST @ 5%" value={`₹${order.gst.toLocaleString("en-IN")}`} />
                  <div className="h-px my-1" style={{ backgroundColor: "#FEF3C7" }} />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-800">Total Paid</span>
                    <span className="font-bold text-lg" style={{ color: "#C05621" }}>
                      ₹{order.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#C05621" }}>
                  🔐 Payment Info
                </p>
                <div className="space-y-2.5">
                  <DetailRow label="Method" value={METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod} />
                  <DetailRow label="Transaction ID" value={order.transactionId} mono />
                  <DetailRow label="Payment Gateway" value="Razorpay" />
                  <DetailRow label="Payment Status" value="Paid" badge="green" />
                </div>
              </div>

              {/* Trust section */}
              <div
                className="p-3 rounded-xl flex items-start gap-2 text-xs"
                style={{ backgroundColor: "#F0FDF4", color: "#15803D" }}
              >
                <Shield size={13} className="flex-shrink-0 mt-0.5" />
                <span>This is a tax invoice. Your payment of <strong>₹{order.total.toLocaleString("en-IN")}</strong> has been received and confirmed via Razorpay.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── FURTHER STEPS ────────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl border p-6 mb-6"
          style={{ borderColor: "#FBCFB8", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xl">🗓️</span>
            <h2 style={{ color: "#1C1917", fontSize: "1.05rem", fontWeight: 700 }}>What Happens Next</h2>
          </div>

          <div className="relative">
            {/* Vertical connector */}
            <div
              className="absolute left-5 top-6 bottom-6 w-0.5 hidden sm:block"
              style={{ backgroundColor: "#FBCFB8" }}
            />

            <div className="space-y-5">
              {TIMELINE.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 text-lg"
                    style={{
                      backgroundColor: step.done ? "#D1FAE5" : idx === 1 ? "#FFF0E9" : "#F9FAFB",
                      border: `2px solid ${step.done ? "#6EE7B7" : idx === 1 ? "#FDBA74" : "#E5E7EB"}`,
                    }}
                  >
                    {step.icon}
                  </div>
                  <div className="flex-1 pt-1.5">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-semibold text-gray-800">{step.title}</p>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: step.done ? "#D1FAE5" : idx === 1 ? "#FFF0E9" : "#F3F4F6",
                          color: step.done ? "#059669" : idx === 1 ? "#C05621" : "#6B7280",
                        }}
                      >
                        {step.timing}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support callout */}
          <div
            className="mt-6 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            style={{ backgroundColor: "#FFF0E9", border: "1px solid #FDBA74" }}
          >
            <div>
              <p className="text-sm font-semibold text-gray-800">Need help with your booking?</p>
              <p className="text-xs text-gray-500 mt-0.5">Our coordinators are available 7 days a week · 9 AM – 9 PM IST</p>
            </div>
            <div className="flex gap-2">
              <a
                href="https://wa.me/919876543210"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white"
                style={{ backgroundColor: "#25D366" }}
              >
                <MessageCircle size={13} /> WhatsApp
              </a>
              <a
                href="tel:+919876543210"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border"
                style={{ borderColor: "#E77237", color: "#E77237", backgroundColor: "white" }}
              >
                <Phone size={13} /> Call
              </a>
            </div>
          </div>
        </div>

        {/* ── RECOMMENDED PUJAS ────────────────────────────────────────── */}
        {recommended.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <h2 style={{ color: "#1C1917", fontSize: "1.05rem", fontWeight: 700 }}>
                  Recommended Pujas
                </h2>
              </div>
              <button
                onClick={() => navigate("/all-pujas")}
                className="text-sm flex items-center gap-1"
                style={{ color: "#E77237" }}
              >
                View all <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommended.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/pooja/${p.id}`)}
                  className="bg-white rounded-2xl overflow-hidden border cursor-pointer transition-all hover:shadow-md group flex flex-col"
                  style={{ borderColor: "#FEE2E2" }}
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: "16/9", flexShrink: 0 }}>
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <span
                      className="absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-medium text-white"
                      style={{ backgroundColor: p.tagColor }}
                    >
                      {p.tag}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-sm font-semibold text-gray-800 leading-snug mb-1">{p.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">{p.description}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">Starting from</p>
                        <p className="font-bold text-sm" style={{ color: "#E77237" }}>
                          ₹{p.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Star size={10} fill="#F59E0B" stroke="#F59E0B" />
                          {p.rating}
                        </span>
                        <button
                          className="text-xs px-3 py-1.5 rounded-full text-white flex items-center gap-1 font-medium"
                          style={{ backgroundColor: "#E77237" }}
                        >
                          Book <ArrowRight size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back to home */}
        <div className="flex items-center justify-center pb-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl border font-medium transition-all hover:bg-orange-50"
            style={{ borderColor: "#FBCFB8", color: "#C05621" }}
          >
            🏠 Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function DetailRow({ label, value, highlight, mono, badge }: {
  label: string; value: string; highlight?: boolean; mono?: boolean; badge?: "green";
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-gray-400 flex-shrink-0 pt-0.5">{label}</span>
      {badge === "green" ? (
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "#D1FAE5", color: "#059669" }}>
          {value}
        </span>
      ) : (
        <span
          className={`text-xs text-right leading-relaxed ${mono ? "font-mono" : "font-medium"}`}
          style={{ color: highlight ? "#C05621" : "#374151" }}
        >
          {value}
        </span>
      )}
    </div>
  );
}

function PriceRow({ label, value, isGreen }: { label: string; value: string; isGreen?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs font-medium ${isGreen ? "text-green-600" : "text-gray-700"}`}>{value}</span>
    </div>
  );
}