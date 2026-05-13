import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { saveOrder } from "../utils/orderStorage";
import { ALL_POOJAS } from "../data/pujaData";
import {
  ChevronLeft, Check, X, AlertCircle, Info, Tag, Shield,
  CreditCard, Smartphone, Building2, Wallet,
  Plus, Minus, Star, Pencil, Lock, Loader2,
} from "lucide-react";
import { BookingProgress } from "../components/BookingProgress";

// ─── DATA ────────────────────────────────────────────────────────────────────

const DATE_SLOTS = [
  {
    date: "2026-05-11", day: "Mon", dateNum: "11", month: "May",
    note: "Amavasya", isAuspicious: true,
    slots: [
      { time: "06:00 AM", available: true, auspicious: true, note: "Brahma Muhurta" },
      { time: "07:30 AM", available: true, auspicious: false, note: "" },
      { time: "09:00 AM", available: false, auspicious: false, note: "Fully booked" },
      { time: "11:00 AM", available: true, auspicious: false, note: "" },
      { time: "01:00 PM", available: true, auspicious: false, note: "" },
      { time: "05:00 PM", available: false, auspicious: false, note: "Fully booked" },
    ],
  },
  {
    date: "2026-05-18", day: "Mon", dateNum: "18", month: "May",
    note: "Shravan Somvar", isAuspicious: false,
    slots: [
      { time: "06:30 AM", available: true, auspicious: true, note: "Abhijit Muhurta" },
      { time: "08:00 AM", available: true, auspicious: false, note: "" },
      { time: "10:30 AM", available: true, auspicious: false, note: "" },
      { time: "12:00 PM", available: false, auspicious: false, note: "Fully booked" },
      { time: "02:30 PM", available: true, auspicious: false, note: "" },
      { time: "04:30 PM", available: true, auspicious: false, note: "" },
    ],
  },
  {
    date: "2026-05-25", day: "Mon", dateNum: "25", month: "May",
    note: "Panchami Tithi", isAuspicious: false,
    slots: [
      { time: "06:00 AM", available: true, auspicious: true, note: "Brahma Muhurta" },
      { time: "09:30 AM", available: true, auspicious: false, note: "" },
      { time: "11:00 AM", available: false, auspicious: false, note: "Fully booked" },
      { time: "01:30 PM", available: true, auspicious: false, note: "" },
      { time: "03:00 PM", available: true, auspicious: false, note: "" },
      { time: "05:30 PM", available: false, auspicious: false, note: "Fully booked" },
    ],
  },
  {
    date: "2026-06-01", day: "Sun", dateNum: "1", month: "Jun",
    note: "Amavasya", isAuspicious: true,
    slots: [
      { time: "05:30 AM", available: true, auspicious: true, note: "Brahma Muhurta" },
      { time: "07:00 AM", available: true, auspicious: true, note: "Auspicious Muhurta" },
      { time: "09:00 AM", available: false, auspicious: false, note: "Fully booked" },
      { time: "11:30 AM", available: false, auspicious: false, note: "Fully booked" },
      { time: "02:00 PM", available: true, auspicious: false, note: "" },
      { time: "04:00 PM", available: true, auspicious: false, note: "" },
    ],
  },
  {
    date: "2026-06-08", day: "Mon", dateNum: "8", month: "Jun",
    note: "Nag Panchami", isAuspicious: true,
    slots: [
      { time: "06:00 AM", available: true, auspicious: true, note: "Brahma Muhurta" },
      { time: "08:30 AM", available: true, auspicious: false, note: "" },
      { time: "10:00 AM", available: true, auspicious: false, note: "" },
      { time: "12:30 PM", available: false, auspicious: false, note: "Fully booked" },
      { time: "03:00 PM", available: true, auspicious: false, note: "" },
      { time: "05:00 PM", available: true, auspicious: false, note: "" },
    ],
  },
  {
    date: "2026-06-15", day: "Mon", dateNum: "15", month: "Jun",
    note: "Shravan Somvar", isAuspicious: false,
    slots: [
      { time: "06:00 AM", available: true, auspicious: false, note: "" },
      { time: "08:00 AM", available: true, auspicious: false, note: "" },
      { time: "10:30 AM", available: true, auspicious: false, note: "" },
      { time: "12:00 PM", available: true, auspicious: false, note: "" },
      { time: "02:00 PM", available: false, auspicious: false, note: "Fully booked" },
      { time: "04:00 PM", available: true, auspicious: false, note: "" },
    ],
  },
];

const PACKAGES = [
  {
    id: "essential" as const,
    name: "Shanti Puja",
    price: 5100,
    color: "#1D4ED8",
    maxMembers: 1,
    desc: "Targeted remedy for a single Dosha. Sankalp, Navagraha Puja & Prasad delivery included.",
    includes: ["Sankalp (1 person)", "Full 10-Step Ritual Vidhi", "108 Mantra Japa", "Prasad dispatch"],
  },
  {
    id: "recommended" as const,
    name: "Maha Shanti",
    price: 11000,
    popular: true,
    color: "#C05621",
    maxMembers: 3,
    desc: "Full family remedy — Homam, live stream, family Sankalp & puja certificate.",
    includes: ["Sankalp (3 persons)", "Navagraha Homam", "Live stream", "Prasad dispatch", "Certificate"],
  },
  {
    id: "supreme" as const,
    name: "Ati Maha Sarpa Yagya",
    price: 21000,
    color: "#7C3AED",
    maxMembers: 11,
    desc: "Comprehensive 2-day ritual for the entire family lineage with full coverage.",
    includes: ["Sankalp (11 persons)", "Extended Homam", "2-day ritual", "Puja video link", "Certificate"],
  },
];

const ADDONS = [
  { id: "extra-sankalp", label: "Extra Sankalp", price: 500, icon: "👥", desc: "Add 1 more person to the Sankalp (per head)" },
  { id: "puja-video", label: "Puja Video Recording", price: 750, icon: "🎬", desc: "Lifetime access link to the recorded ritual" },
  { id: "certificate", label: "Digital Certificate", price: 250, icon: "📜", desc: "Official puja completion certificate (PDF)" },
  { id: "express-prasad", label: "Express Prasad Delivery", price: 350, icon: "🚚", desc: "Priority dispatch — delivered within 3 days" },
];

const VALID_COUPONS: Record<string, { discount: number; label: string }> = {
  "PUJA100": { discount: 100, label: "₹100 off" },
  "FIRST500": { discount: 500, label: "₹500 off (first booking)" },
  "AMAVASYA750": { discount: 750, label: "₹750 off (Amavasya special)" },
};

const RETURNING_USER = {
  name: "Ramesh Subramaniam",
  email: "ramesh@example.com",
  mobile: "+91 98765 43210",
  dob: "1985-03-15",
  birthTime: "10:30 AM",
  birthPlace: "Chennai, Tamil Nadu",
  moonSign: "Mesha (Aries)",
  birthStar: "Ashwini",
  gender: "male",
  gotra: "Kashyap",
  sankalp: "",
};

const MOON_SIGNS = ["Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)", "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrischika (Scorpio)", "Dhanus (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"];
const BIRTH_STARS = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Moola", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];

type PkgId = "essential" | "recommended" | "supreme";

interface PersonForm {
  name: string; email: string; mobile: string;
  dob: string; birthTime: string; birthPlace: string;
  moonSign: string; birthStar: string; gender: string;
  gotra: string; sankalp: string;
}

interface MemberForm {
  id: string; name: string; dob: string; birthPlace: string; gender: string; relation: string;
}

const emptyForm: PersonForm = {
  name: "", email: "", mobile: "", dob: "", birthTime: "",
  birthPlace: "", moonSign: "", birthStar: "", gender: "", gotra: "", sankalp: "",
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function DateTimePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const pkgFromNav = (location.state as { packageId?: PkgId } | null)?.packageId;

  // Package & add-ons
  const [selectedPkg, setSelectedPkg] = useState<PkgId>(pkgFromNav ?? "recommended");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Date / time
  const [selectedDate, setSelectedDate] = useState(DATE_SLOTS[0].date);
  const [selectedTime, setSelectedTime] = useState(
    DATE_SLOTS[0].slots.find((s) => s.available)?.time ?? ""
  );

  // User details
  const [isReturning, setIsReturning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [bookingFor, setBookingFor] = useState<"self" | "other">("self");
  const [form, setForm] = useState<PersonForm>(emptyForm);
  const [members, setMembers] = useState<MemberForm[]>([]);

  // Coupon
  const [couponInput, setCouponInput] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLabel, setCouponLabel] = useState("");
  const [couponError, setCouponError] = useState("");

  // Payment
  const [agreed, setAgreed] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);

  // Dynamic puja lookup
  const pujaData = ALL_POOJAS.find((p) => p.id === id) ?? ALL_POOJAS[0];
  const pujaName = pujaData.name;

  const pkg = PACKAGES.find((p) => p.id === selectedPkg)!;
  const currentDateSlot = DATE_SLOTS.find((d) => d.date === selectedDate)!;

  // When date changes, auto-select first available slot for new date
  useEffect(() => {
    const firstAvailable = currentDateSlot.slots.find((s) => s.available);
    setSelectedTime(firstAvailable?.time ?? "");
  }, [selectedDate]);

  // When returning user toggled, prefill/clear
  useEffect(() => {
    if (isReturning) {
      setForm({ ...RETURNING_USER });
      setIsEditing(false);
    } else {
      setForm(emptyForm);
    }
  }, [isReturning]);

  // Price calculation
  const addonTotal = selectedAddons.reduce((sum, id) => {
    return sum + (ADDONS.find((a) => a.id === id)?.price ?? 0);
  }, 0);
  const subtotal = pkg.price + addonTotal;
  const discounted = Math.max(0, subtotal - couponDiscount);
  const gst = Math.round(discounted * 0.05);
  const grandTotal = discounted + gst;

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (VALID_COUPONS[code]) {
      setCouponDiscount(VALID_COUPONS[code].discount);
      setCouponLabel(VALID_COUPONS[code].label);
      setCouponError("");
    } else {
      setCouponDiscount(0);
      setCouponLabel("");
      setCouponError("Invalid coupon code. Try PUJA100 or FIRST500.");
    }
  };

  const removeCoupon = () => {
    setCouponDiscount(0);
    setCouponLabel("");
    setCouponInput("");
    setCouponError("");
  };

  const addMember = () => {
    if (members.length < pkg.maxMembers - 1) {
      setMembers((prev) => [
        ...prev,
        { id: Date.now().toString(), name: "", dob: "", birthPlace: "", gender: "", relation: "" },
      ]);
    }
  };

  const removeMember = (id: string) => setMembers((prev) => prev.filter((m) => m.id !== id));

  const updateMember = (id: string, field: keyof MemberForm, value: string) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handlePayNow = () => {
    if (!agreed) return;
    setShowRazorpay(true);
  };

  const handlePaymentSuccess = (method: string) => {
    const dateInfo = DATE_SLOTS.find((d) => d.date === selectedDate);
    const orderId = `ORD-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const order = {
      orderId,
      pujaName,
      pujaId: id ?? pujaData.id,
      packageName: pkg.name,
      packagePrice: pkg.price,
      addons: selectedAddons.map((id) => ADDONS.find((a) => a.id === id)?.label ?? id),
      addonTotal,
      couponDiscount,
      gst,
      total: grandTotal,
      date: dateInfo ? `${dateInfo.day}, ${dateInfo.dateNum} ${dateInfo.month}` : "",
      dateISO: selectedDate,
      time: selectedTime,
      devotee: (isReturning && !isEditing) ? "Ramesh Subramaniam" : (form.name || "Devotee"),
      email: (isReturning && !isEditing) ? "ramesh@example.com" : form.email,
      paymentMethod: method,
      transactionId: `TXN${Date.now().toString().slice(-8)}`,
      bookingTimestamp: new Date().toISOString(),
      status: "booked" as const,
    };
    saveOrder(order);
    setShowRazorpay(false);
    navigate("/booking/invoice", { state: order });
  };

  return (
    <div style={{ backgroundColor: "#F8F7FA", fontFamily: "'Public Sans', sans-serif", minHeight: "100vh" }}>
      <BookingProgress currentStep={3} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <button
          className="flex items-center gap-1.5 text-sm mb-5 transition-colors"
          style={{ color: "#C05621" }}
          onClick={() => navigate(`/pooja/${id}`)}
        >
          <ChevronLeft size={16} /> Back to Puja Details
        </button>

        <div className="mb-6">
          <h1
            style={{ fontFamily: "'Public Sans', sans-serif", color: "#1C1917", fontSize: "1.55rem", fontWeight: 700 }}
          >
            Schedule Your Puja
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>
            {pujaName} · iMeUsWe Puja Center, Bengaluru
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* ── LEFT COLUMN ────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* 1. SELECTED PACKAGE */}
            <SectionCard title="📦 Selected Package" subtitle="Package selected from the Puja Details page.">
              {/* Compact selected-package display */}
              <div
                className="flex items-start gap-3 p-3.5 rounded-xl border-2"
                style={{ borderColor: pkg.color, backgroundColor: `${pkg.color}10` }}
              >
                <div
                  className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center"
                  style={{ borderColor: pkg.color, backgroundColor: pkg.color }}
                >
                  <Check size={11} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-800">{pkg.name}</p>
                    <p className="font-bold text-sm" style={{ color: pkg.color }}>₹{pkg.price.toLocaleString("en-IN")}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{pkg.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {pkg.includes.map((inc) => (
                      <span key={inc} className="text-xs px-2 py-0.5 rounded-full bg-white/70 text-gray-600">{inc}</span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/pooja/${id}`)}
                  className="text-xs flex-shrink-0 px-2.5 py-1.5 rounded-lg border font-medium whitespace-nowrap"
                  style={{ borderColor: "#FBCFB8", color: "#C05621", backgroundColor: "white" }}
                >
                  Change
                </button>
              </div>

              {/* Add-ons */}
              <div className="mt-4 pt-4 border-t border-orange-100">
                <p className="text-xs font-semibold text-gray-700 mb-2.5 flex items-center gap-1.5">
                  ✚ Add-ons <span className="font-normal text-gray-400">(optional)</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ADDONS.map((addon) => {
                    const sel = selectedAddons.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all"
                        style={{
                          borderColor: sel ? "#E77237" : "#E5E7EB",
                          backgroundColor: sel ? "#FFF0E9" : "white",
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all"
                          style={{
                            borderColor: sel ? "#E77237" : "#D1D5DB",
                            backgroundColor: sel ? "#E77237" : "transparent",
                          }}
                        >
                          {sel && <Check size={9} className="text-white" />}
                        </div>
                        <span className="text-sm">{addon.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700">{addon.label}</p>
                          <p className="text-xs text-gray-400">{addon.desc}</p>
                        </div>
                        <span className="text-xs font-semibold flex-shrink-0" style={{ color: "#E77237" }}>+₹{addon.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </SectionCard>

            {/* 2. DATE SELECTION */}
            <SectionCard
              title="🌑 Select Date"
              subtitle="6 best dates curated from the Vedic calendar for this puja."
            >
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {DATE_SLOTS.map((d) => {
                  const isSelected = selectedDate === d.date;
                  return (
                    <div
                      key={d.date}
                      onClick={() => setSelectedDate(d.date)}
                      className="flex flex-col items-center p-2.5 rounded-xl border-2 cursor-pointer transition-all relative"
                      style={{
                        borderColor: isSelected ? "#C05621" : "#E5E7EB",
                        backgroundColor: isSelected ? "#FFF0E9" : "white",
                      }}
                    >
                      {d.isAuspicious && (
                        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2">
                          <Star size={10} fill="#F59E0B" stroke="#F59E0B" />
                        </span>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">{d.day}</p>
                      <p className="text-lg font-bold leading-tight" style={{ color: isSelected ? "#C05621" : "#1C1917" }}>{d.dateNum}</p>
                      <p className="text-xs text-gray-500">{d.month}</p>
                      <p className="text-xs mt-1 text-center leading-tight" style={{ color: "#9CA3AF", fontSize: "0.6rem" }}>
                        {d.note}
                      </p>
                    </div>
                  );
                })}
              </div>
              <p className="flex items-center gap-1.5 text-xs mt-3" style={{ color: "#9CA3AF" }}>
                <Star size={10} fill="#F59E0B" stroke="#F59E0B" /> Starred dates are especially auspicious for Kaal Sarpa Dosh
              </p>

              {/* TIME SLOTS */}
              <div className="mt-4 pt-4 border-t border-orange-100">
                <p className="text-xs font-semibold text-gray-700 mb-2.5">
                  🕐 Available Time Slots —{" "}
                  <span className="font-normal text-gray-400">
                    {DATE_SLOTS.find((d) => d.date === selectedDate)?.day},{" "}
                    {DATE_SLOTS.find((d) => d.date === selectedDate)?.dateNum}{" "}
                    {DATE_SLOTS.find((d) => d.date === selectedDate)?.month}
                  </span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {currentDateSlot.slots.map((slot) => {
                    const isSelected = selectedTime === slot.time;
                    return (
                      <div
                        key={slot.time}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        className="p-2.5 rounded-xl border-2 text-center transition-all"
                        style={{
                          cursor: slot.available ? "pointer" : "not-allowed",
                          borderColor: !slot.available ? "#E5E7EB" : isSelected ? "#C05621" : "#E5E7EB",
                          backgroundColor: !slot.available ? "#F9FAFB" : isSelected ? "#FFF0E9" : "white",
                          opacity: slot.available ? 1 : 0.45,
                        }}
                      >
                        <p className="text-sm font-semibold text-gray-800">{slot.time}</p>
                        {slot.note && (
                          <p className="text-xs mt-0.5 leading-tight" style={{ color: "#9CA3AF", fontSize: "0.65rem" }}>
                            {slot.auspicious && slot.available && "⭐ "}{slot.note}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs mt-2 flex items-center gap-1" style={{ color: "#9CA3AF" }}>
                  <Info size={11} /> Live-stream link will be sent 12 hours before the puja
                </p>
              </div>
            </SectionCard>

            {/* 3. USER DETAILS */}
            <SectionCard
              title="👤 Your Details"
              subtitle="Used for Sankalp — please ensure accuracy. Your data is secure and never shared."
            >
              {/* Returning / New toggle */}
              <div className="flex gap-2 mb-4">
                {[
                  { val: false, label: "New Devotee" },
                  { val: true, label: "Returning Devotee" },
                ].map(({ val, label }) => (
                  <button
                    key={label}
                    onClick={() => setIsReturning(val)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all"
                    style={{
                      borderColor: isReturning === val ? "#E77237" : "#E5E7EB",
                      backgroundColor: isReturning === val ? "#FFF0E9" : "white",
                      color: isReturning === val ? "#C05621" : "#6B7280",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Book for Self / Other */}
              <div className="flex gap-2 mb-4">
                {[
                  { val: "self" as const, label: "🙏 Booking for Myself" },
                  { val: "other" as const, label: "👥 Booking for Someone Else" },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    onClick={() => setBookingFor(val)}
                    className="flex-1 py-2 rounded-lg text-xs font-medium border-2 transition-all"
                    style={{
                      borderColor: bookingFor === val ? "#E77237" : "#E5E7EB",
                      backgroundColor: bookingFor === val ? "#FFF0E9" : "white",
                      color: bookingFor === val ? "#C05621" : "#6B7280",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Returning user card — editable */}
              {isReturning && !isEditing ? (
                <div className="p-4 rounded-xl border mb-4" style={{ backgroundColor: "#F0FDF4", borderColor: "#86EFAC" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ backgroundColor: "#C05621" }}
                      >
                        {RETURNING_USER.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{RETURNING_USER.name}</p>
                        <p className="text-xs text-gray-500">{RETURNING_USER.mobile} · {RETURNING_USER.email}</p>
                        <p className="text-xs text-gray-500">DOB: {RETURNING_USER.dob} · {RETURNING_USER.birthPlace}</p>
                        {RETURNING_USER.gotra && <p className="text-xs text-gray-500">Gotra: {RETURNING_USER.gotra}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1 text-xs flex-shrink-0"
                      style={{ color: "#C05621" }}
                    >
                      <Pencil size={12} /> Edit
                    </button>
                  </div>
                </div>
              ) : (
                <PersonFormFields
                  form={form}
                  bookingFor={bookingFor}
                  onChange={(field, val) => setForm((f) => ({ ...f, [field]: val }))}
                />
              )}

              {/* Additional Members */}
              {pkg.maxMembers > 1 && (
                <div className="mt-4 pt-4 border-t border-orange-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-700">
                        Additional Members
                        <span className="ml-1 text-gray-400 font-normal">
                          (up to {pkg.maxMembers - 1} more in {pkg.name})
                        </span>
                      </p>
                    </div>
                    {members.length < pkg.maxMembers - 1 && (
                      <button
                        onClick={addMember}
                        className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all"
                        style={{ borderColor: "#E77237", color: "#E77237", backgroundColor: "#FFF0E9" }}
                      >
                        <Plus size={12} /> Add Member
                      </button>
                    )}
                  </div>

                  {members.length === 0 && (
                    <p className="text-xs text-gray-400 italic">
                      Add birth details of family members to include in the Sankalp.
                    </p>
                  )}

                  <div className="space-y-4">
                    {members.map((member, idx) => (
                      <MemberFormFields
                        key={member.id}
                        index={idx + 1}
                        member={member}
                        onChange={(field, val) => updateMember(member.id, field, val)}
                        onRemove={() => removeMember(member.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div
                className="mt-4 p-3 rounded-lg flex items-start gap-2 text-xs"
                style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
              >
                <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                Birth details are used solely for the Sankalp ritual and booking coordination. We do not share your information with any third party.
              </div>
            </SectionCard>

          </div>

          {/* ── RIGHT COLUMN — STICKY BOOKING SUMMARY ────────────────── */}
          <div className="lg:sticky lg:top-28">
            <BookingSummary
              pkg={pkg}
              pujaName={pujaName}
              selectedAddons={selectedAddons}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              couponInput={couponInput}
              couponDiscount={couponDiscount}
              couponLabel={couponLabel}
              couponError={couponError}
              onCouponInputChange={(v) => { setCouponInput(v); setCouponError(""); }}
              onApplyCoupon={applyCoupon}
              onRemoveCoupon={removeCoupon}
              addonTotal={addonTotal}
              subtotal={subtotal}
              discounted={discounted}
              gst={gst}
              grandTotal={grandTotal}
              agreed={agreed}
              onToggleAgreed={() => setAgreed(!agreed)}
              onPayNow={handlePayNow}
            />
          </div>
        </div>
      </div>

      {/* ── RAZORPAY MODAL ─────────────────────────────────────────────── */}
      {showRazorpay && (
        <RazorpayModal
          amount={grandTotal}
          pujaName={pujaName}
          onClose={() => setShowRazorpay(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

// ─── BOOKING SUMMARY ─────────────────────────────────────────────────────────

function BookingSummary({
  pkg, pujaName, selectedAddons, selectedDate, selectedTime,
  couponInput, couponDiscount, couponLabel, couponError,
  onCouponInputChange, onApplyCoupon, onRemoveCoupon,
  addonTotal, subtotal, discounted, gst, grandTotal,
  agreed, onToggleAgreed, onPayNow,
}: {
  pkg: typeof PACKAGES[0];
  pujaName: string;
  selectedAddons: string[];
  selectedDate: string;
  selectedTime: string;
  couponInput: string;
  couponDiscount: number;
  couponLabel: string;
  couponError: string;
  onCouponInputChange: (v: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  addonTotal: number;
  subtotal: number;
  discounted: number;
  gst: number;
  grandTotal: number;
  agreed: boolean;
  onToggleAgreed: () => void;
  onPayNow: () => void;
}) {
  const dateInfo = DATE_SLOTS.find((d) => d.date === selectedDate);
  const addonsInPkg = ADDONS.filter((a) => selectedAddons.includes(a.id));

  return (
    <div
      className="bg-white rounded-2xl border shadow-sm overflow-hidden"
      style={{ borderColor: "#FDBA74" }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b" style={{ borderColor: "#FEF3C7", backgroundColor: "#FFFBF5" }}>
        <h3 className="font-semibold text-gray-800 text-sm">Booking Summary</h3>
      </div>

      <div className="px-5 py-4 space-y-4">

        {/* Puja + Package info */}
        <div className="space-y-2">
          <SummaryRow label="Puja" value={pujaName} />
          <div className="flex justify-between items-start gap-2">
            <span className="text-xs text-gray-500">Package</span>
            <span className="text-xs font-medium text-gray-700 text-right">{pkg.name}</span>
          </div>
          {dateInfo && selectedTime && (
            <SummaryRow label="Date & Time" value={`${dateInfo.day}, ${dateInfo.dateNum} ${dateInfo.month} · ${selectedTime}`} />
          )}
          {dateInfo?.isAuspicious && (
            <div className="flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5" style={{ backgroundColor: "#FFF7ED", color: "#C05621" }}>
              <Star size={11} fill="#F59E0B" stroke="#F59E0B" /> Auspicious date — {dateInfo.note}
            </div>
          )}
        </div>

        <div className="h-px bg-orange-100" />

        {/* Price breakdown */}
        <div className="space-y-2">
          <SummaryRow label={`${pkg.name}`} value={`₹${pkg.price.toLocaleString("en-IN")}`} />
          {addonsInPkg.map((a) => (
            <SummaryRow key={a.id} label={a.label} value={`+₹${a.price}`} />
          ))}
          {couponDiscount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-green-600 flex items-center gap-1"><Tag size={11} /> {couponLabel}</span>
              <span className="text-xs font-medium text-green-600">−₹{couponDiscount}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Subtotal</span>
            <span className="text-xs font-medium text-gray-700">₹{discounted.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              GST (5%)
              <Info size={10} className="text-gray-400 cursor-help" title="Applicable on religious services provided online." />
            </span>
            <span className="text-xs font-medium text-gray-700">₹{gst.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="h-px bg-orange-100" />

        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-800">Total Payable</span>
          <span className="font-bold text-lg" style={{ color: "#C05621", fontFamily: "'Public Sans', sans-serif" }}>
            ₹{grandTotal.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Coupon */}
        {couponDiscount > 0 ? (
          <div className="flex items-center justify-between p-2.5 rounded-xl border" style={{ backgroundColor: "#F0FDF4", borderColor: "#86EFAC" }}>
            <div className="flex items-center gap-2 text-xs text-green-700">
              <Tag size={13} />
              <span className="font-medium">{couponLabel} applied</span>
            </div>
            <button onClick={onRemoveCoupon} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
              <X size={12} /> Remove
            </button>
          </div>
        ) : (
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponInput}
                onChange={(e) => onCouponInputChange(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && onApplyCoupon()}
                className="flex-1 px-3 py-2 text-xs rounded-lg border outline-none transition-colors uppercase tracking-wide"
                style={{ borderColor: couponError ? "#EF4444" : "#E5E7EB" }}
              />
              <button
                onClick={onApplyCoupon}
                className="px-3 py-2 text-xs font-semibold rounded-lg text-white transition-all"
                style={{ backgroundColor: "#E77237" }}
              >
                Apply
              </button>
            </div>
            {couponError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} /> {couponError}</p>}
          </div>
        )}

        {/* Terms */}
        <div className="flex items-start gap-2">
          <div
            onClick={onToggleAgreed}
            className="w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center cursor-pointer mt-0.5 transition-all"
            style={{
              borderColor: agreed ? "#C05621" : "#D1D5DB",
              backgroundColor: agreed ? "#C05621" : "transparent",
            }}
          >
            {agreed && <Check size={9} className="text-white" />}
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            I agree to the{" "}
            <span className="underline cursor-pointer" style={{ color: "#C05621" }}>Terms & Conditions</span>{" "}
            and{" "}
            <span className="underline cursor-pointer" style={{ color: "#C05621" }}>Cancellation Policy</span>.
          </p>
        </div>

        {/* Pay Now */}
        <button
          onClick={onPayNow}
          disabled={!agreed || !selectedTime}
          className="w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
          style={{
            backgroundColor: agreed && selectedTime ? "#E77237" : "#D1D5DB",
            cursor: agreed && selectedTime ? "pointer" : "not-allowed",
            boxShadow: agreed && selectedTime ? "0 4px 14px rgba(231,114,55,0.35)" : "none",
          }}
        >
          <Lock size={14} />
          Pay ₹{grandTotal.toLocaleString("en-IN")} via Razorpay
        </button>

        {!agreed && (
          <p className="text-xs text-center text-gray-400">Please agree to the terms to proceed</p>
        )}

        {/* Trust */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <Shield size={12} className="text-green-600" />
          <span className="text-xs text-gray-400">256-bit SSL · Secured by Razorpay</span>
        </div>
      </div>
    </div>
  );
}

// ─── RAZORPAY MODAL ───────────────────────────────────────────────────────────

type PayMethod = "upi" | "card" | "netbanking" | "wallet";

function RazorpayModal({ amount, pujaName, onClose, onSuccess }: {
  amount: number;
  pujaName: string;
  onClose: () => void;
  onSuccess: (method: string) => void;
}) {
  const [method, setMethod] = useState<PayMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        onSuccess(method);
      }, 1800);
    }, 2500);
  };

  const PAYMENT_METHODS = [
    { id: "upi" as PayMethod, label: "UPI", icon: <Smartphone size={18} />, desc: "GPay, PhonePe, Paytm" },
    { id: "card" as PayMethod, label: "Card", icon: <CreditCard size={18} />, desc: "Debit / Credit" },
    { id: "netbanking" as PayMethod, label: "Net Banking", icon: <Building2 size={18} />, desc: "All major banks" },
    { id: "wallet" as PayMethod, label: "iMeUsWe Wallet", icon: <Wallet size={18} />, desc: "Balance: ₹1,200" },
  ];

  const BANKS = ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank", "Yes Bank", "Punjab National Bank", "Bank of Baroda"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.65)" }}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden"
        style={{ maxWidth: "520px", maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ backgroundColor: "#1C1917" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <span className="text-lg">🙏</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">iMeUsWe Puja</p>
              <p className="text-orange-200 text-xs">{pujaName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-white font-bold">₹{amount.toLocaleString("en-IN")}</p>
              <p className="text-orange-200 text-xs">Total payable</p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <X size={14} className="text-white" />
            </button>
          </div>
        </div>

        {success ? (
          /* Success screen */
          <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: "#D1FAE5" }}
            >
              <Check size={32} style={{ color: "#059669" }} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">Payment Successful!</h3>
            <p className="text-sm text-gray-500 mb-2">Booking confirmed · ₹{amount.toLocaleString("en-IN")}</p>
            <p className="text-xs text-gray-400">Confirmation details have been sent to your email. 🙏 Jai Shri Ram!</p>
          </div>
        ) : (
          <div className="p-5">
            {/* Payment method tabs */}
            <p className="text-xs text-gray-500 mb-3 font-medium">SELECT PAYMENT METHOD</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: method === m.id ? "#C05621" : "#E5E7EB",
                    backgroundColor: method === m.id ? "#FFF7ED" : "white",
                    color: method === m.id ? "#C05621" : "#6B7280",
                  }}
                >
                  {m.icon}
                  <span className="text-xs font-semibold">{m.label}</span>
                  <span className="text-xs text-gray-400 text-center leading-tight" style={{ fontSize: "0.6rem" }}>{m.desc}</span>
                </button>
              ))}
            </div>

            {/* Method-specific form */}
            <div className="space-y-3 mb-5">
              {method === "upi" && (
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">UPI ID</label>
                  <input
                    type="text"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none"
                    style={{ borderColor: "#E5E7EB" }}
                    onFocus={(e) => (e.target.style.borderColor = "#C05621")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                  />
                  <p className="text-xs text-gray-400 mt-1">Enter your UPI ID and click Pay to receive a payment request</p>
                </div>
              )}

              {method === "card" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim())}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none font-mono tracking-wider"
                      style={{ borderColor: "#E5E7EB" }}
                      onFocus={(e) => (e.target.style.borderColor = "#C05621")}
                      onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none"
                        style={{ borderColor: "#E5E7EB" }}
                        onFocus={(e) => (e.target.style.borderColor = "#C05621")}
                        onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">CVV</label>
                      <input
                        type="password"
                        placeholder="• • •"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none"
                        style={{ borderColor: "#E5E7EB" }}
                        onFocus={(e) => (e.target.style.borderColor = "#C05621")}
                        onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Name on Card</label>
                    <input
                      type="text"
                      placeholder="As on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none"
                      style={{ borderColor: "#E5E7EB" }}
                      onFocus={(e) => (e.target.style.borderColor = "#C05621")}
                      onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                    />
                  </div>
                </div>
              )}

              {method === "netbanking" && (
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Select Bank</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none bg-white"
                    style={{ borderColor: "#E5E7EB" }}
                  >
                    <option value="">-- Choose your bank --</option>
                    {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                  {selectedBank && (
                    <p className="text-xs text-gray-400 mt-1.5">You will be redirected to {selectedBank}'s secure portal to complete payment.</p>
                  )}
                </div>
              )}

              {method === "wallet" && (
                <div
                  className="p-4 rounded-xl border"
                  style={{ backgroundColor: "#F0FDF4", borderColor: "#86EFAC" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Wallet size={15} /> iMeUsWe Wallet</p>
                    <span className="text-sm font-bold text-green-700">₹1,200 available</span>
                  </div>
                  {amount <= 1200 ? (
                    <p className="text-xs text-green-600">✓ Sufficient balance to complete this payment</p>
                  ) : (
                    <div>
                      <p className="text-xs text-orange-600">⚠ Insufficient balance. Short by ₹{(amount - 1200).toLocaleString("en-IN")}</p>
                      <button className="text-xs mt-1.5 underline" style={{ color: "#C05621" }}>Recharge Wallet →</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Security note */}
            <div
              className="p-3 rounded-xl flex items-center gap-2 text-xs mb-4"
              style={{ backgroundColor: "#F0FDF4", color: "#15803D" }}
            >
              <Shield size={13} className="flex-shrink-0" />
              Payment powered by <strong className="ml-0.5">Razorpay</strong> — 256-bit SSL encrypted. Your data is safe.
            </div>

            {/* Pay button */}
            <button
              onClick={handlePay}
              disabled={processing}
              className="w-full py-4 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                backgroundColor: processing ? "#D1D5DB" : "#E77237",
                cursor: processing ? "not-allowed" : "pointer",
                boxShadow: processing ? "none" : "0 4px 18px rgba(192,86,33,0.4)",
              }}
            >
              {processing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing payment…
                </>
              ) : (
                <>
                  <Lock size={14} />
                  Pay ₹{amount.toLocaleString("en-IN")} Securely
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PERSON FORM FIELDS ───────────────────────────────────────────────────────

function PersonFormFields({ form, bookingFor, onChange }: {
  form: PersonForm;
  bookingFor: "self" | "other";
  onChange: (field: keyof PersonForm, val: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      <FormField
        label={bookingFor === "other" ? "Their Full Name *" : "Full Name *"}
        placeholder="As used for the Sankalp"
        value={form.name} onChange={(v) => onChange("name", v)} required
      />
      <FormField
        label="Email Address *"
        type="email"
        placeholder="For booking confirmation"
        value={form.email} onChange={(v) => onChange("email", v)} required
      />
      <FormField
        label="Mobile Number *"
        type="tel"
        placeholder="+91 XXXXX XXXXX"
        value={form.mobile} onChange={(v) => onChange("mobile", v)} required
      />
      <FormField
        label="Date of Birth *"
        type="date"
        value={form.dob} onChange={(v) => onChange("dob", v)} required
      />
      <FormField
        label="Birth Time (optional)"
        placeholder="e.g. 10:30 AM"
        value={form.birthTime} onChange={(v) => onChange("birthTime", v)}
      />
      <FormField
        label="Birth Place *"
        placeholder="City, State"
        value={form.birthPlace} onChange={(v) => onChange("birthPlace", v)} required
      />

      {/* Gender */}
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Gender *</label>
        <select
          value={form.gender}
          onChange={(e) => onChange("gender", e.target.value)}
          className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none bg-white"
          style={{ borderColor: "#E5E7EB" }}
          onFocus={(e) => (e.target.style.borderColor = "#C05621")}
          onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Prefer not to say</option>
        </select>
      </div>

      {/* Moon sign */}
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Moon Sign / Rashi <span className="text-gray-400">(optional)</span></label>
        <select
          value={form.moonSign}
          onChange={(e) => onChange("moonSign", e.target.value)}
          className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none bg-white"
          style={{ borderColor: "#E5E7EB" }}
          onFocus={(e) => (e.target.style.borderColor = "#C05621")}
          onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
        >
          <option value="">Select Rashi</option>
          {MOON_SIGNS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Birth star */}
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Birth Star / Nakshatra <span className="text-gray-400">(optional)</span></label>
        <select
          value={form.birthStar}
          onChange={(e) => onChange("birthStar", e.target.value)}
          className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none bg-white"
          style={{ borderColor: "#E5E7EB" }}
          onFocus={(e) => (e.target.style.borderColor = "#C05621")}
          onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
        >
          <option value="">Select Nakshatra</option>
          {BIRTH_STARS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <FormField
        label="Gotra (optional)"
        placeholder="Paternal lineage, e.g. Kashyap"
        value={form.gotra} onChange={(v) => onChange("gotra", v)}
      />

      {/* Sankalp */}
      <div className="sm:col-span-2">
        <label className="text-xs font-medium text-gray-600 block mb-1">
          Sankalp — Your Wish / Intention <span className="text-gray-400">(max 200 characters)</span>
        </label>
        <textarea
          placeholder="e.g. 'Remove the effects of Kaal Sarpa Dosh and bring peace and prosperity to my family'"
          value={form.sankalp}
          maxLength={200}
          onChange={(e) => onChange("sankalp", e.target.value)}
          rows={2}
          className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none resize-none"
          style={{ borderColor: "#E5E7EB" }}
          onFocus={(e) => (e.target.style.borderColor = "#C05621")}
          onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
        />
        <p className="text-xs text-gray-400 mt-0.5 text-right">{form.sankalp.length}/200</p>
      </div>
    </div>
  );
}

// ─── MEMBER FORM FIELDS ───────────────────────────────────────────────────────

function MemberFormFields({ index, member, onChange, onRemove }: {
  index: number;
  member: MemberForm;
  onChange: (field: keyof MemberForm, val: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="p-3.5 rounded-xl border bg-gray-50" style={{ borderColor: "#E5E7EB" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-700">Member {index}</p>
        <button
          onClick={onRemove}
          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
        >
          <Minus size={12} /> Remove
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Full Name *" placeholder="Member's full name" value={member.name} onChange={(v) => onChange("name", v)} required />
        <FormField label="Relation *" placeholder="e.g. Spouse, Parent" value={member.relation} onChange={(v) => onChange("relation", v)} required />
        <FormField label="Date of Birth *" type="date" value={member.dob} onChange={(v) => onChange("dob", v)} required />
        <FormField label="Birth Place *" placeholder="City, State" value={member.birthPlace} onChange={(v) => onChange("birthPlace", v)} required />
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Gender *</label>
          <select
            value={member.gender}
            onChange={(e) => onChange("gender", e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none bg-white"
            style={{ borderColor: "#E5E7EB" }}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Prefer not to say</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ─── SHARED PRIMITIVES ────────────────────────────────────────────────────────

function FormField({ label, type = "text", placeholder = "", value, onChange, required }: {
  label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none transition-colors"
        style={{ borderColor: "#E5E7EB" }}
        onFocus={(e) => (e.target.style.borderColor = "#C05621")}
        onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
        required={required}
      />
    </div>
  );
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5">
      <h3 className="font-semibold text-gray-800 mb-0.5" style={{ fontFamily: "'Public Sans', sans-serif" }}>{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mb-4">{subtitle}</p>}
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-medium text-gray-700">{value}</span>
    </div>
  );
}
