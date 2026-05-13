import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Search, X, Calendar, Package, ChevronRight, Clock,
  Video, AlertTriangle, FileText, Edit3, XCircle,
  Users, ChevronDown, ChevronUp, RefreshCw, RotateCcw,
  CheckCircle2, Lock, Play, ExternalLink, Info, Shield,
  ChevronLeft, Star,
} from "lucide-react";
import {
  getOrders, updateOrder, cancelOrder, seedDemoOrders,
  type StoredOrder, type OrderStatus, type OrderMember,
} from "../utils/orderStorage";
import { ALL_POOJAS } from "../data/pujaData";
import { Footer } from "../components/Footer";

// ─── STAGE CONFIG ─────────────────────────────────────────────────────────────

const PUJA_STAGES: { key: string; label: string; short: string; icon: string; color: string }[] = [
  { key: "booked",        label: "Puja Booked",          short: "Booked",    icon: "📋", color: "#E77237" },
  { key: "confirmed",     label: "Puja Confirmed",        short: "Confirmed", icon: "✅", color: "#059669" },
  { key: "video_updated", label: "Video Link Updated",    short: "Video Ready", icon: "📹", color: "#7C3AED" },
  { key: "live",          label: "Live / On-going",       short: "Live",      icon: "🔴", color: "#DC2626" },
  { key: "completed",     label: "Completed",             short: "Done",      icon: "🙏", color: "#0891B2" },
];

function getStageIndex(status: OrderStatus): number {
  const map: Record<string, number> = {
    pending: 0, booked: 0, confirmed: 1, video_updated: 2, live: 3, completed: 4,
  };
  return map[status] ?? 0;
}

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string; dot?: string }> = {
  booked:        { bg: "#FFF0E9", text: "#C05621", label: "Puja Booked" },
  pending:       { bg: "#FFF0E9", text: "#C05621", label: "Puja Booked" },
  confirmed:     { bg: "#D1FAE5", text: "#059669", label: "Confirmed" },
  video_updated: { bg: "#EDE9FE", text: "#7C3AED", label: "Video Ready" },
  live:          { bg: "#FEE2E2", text: "#DC2626", label: "🔴 Live Now" },
  completed:     { bg: "#CFFAFE", text: "#0891B2", label: "Completed" },
  cancelled:     { bg: "#F3F4F6", text: "#6B7280", label: "Cancelled" },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function parsePujaDateTime(dateISO: string | undefined, date: string, time: string): Date | null {
  try {
    if (dateISO) {
      // dateISO like "2026-05-11", time like "06:00 AM"
      const [h, mPart] = time.split(":");
      const mins = mPart.slice(0, 2);
      const ampm = mPart.slice(3);
      let hours = parseInt(h, 10);
      if (ampm === "PM" && hours !== 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
      const d = new Date(dateISO);
      d.setHours(hours, parseInt(mins, 10), 0, 0);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  } catch { return null; }
}

function canJoinPuja(order: StoredOrder): boolean {
  if (order.status === "live") return true;
  if (order.status !== "video_updated") return false;
  const dt = parsePujaDateTime(order.dateISO, order.date, order.time);
  if (!dt) return false;
  const now = Date.now();
  const diff = dt.getTime() - now;
  return diff <= 30 * 60 * 1000 && diff >= -4 * 3600 * 1000; // 30 min before to 4h after
}

function getJoinCountdown(order: StoredOrder): string | null {
  if (order.status === "live") return null;
  if (order.status !== "video_updated") return null;
  const dt = parsePujaDateTime(order.dateISO, order.date, order.time);
  if (!dt) return null;
  const diff = dt.getTime() - Date.now();
  if (diff <= 0) return null;
  const mins = Math.ceil(diff / 60000);
  if (mins > 1440) {
    const days = Math.ceil(mins / 1440);
    return `Puja in ${days} day${days > 1 ? "s" : ""}`;
  }
  if (mins > 60) {
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return `Puja in ${hrs}h ${rem}m`;
  }
  return `Join opens in ${mins} min`;
}

const ALL_MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ─── PACKAGE OPTIONS (for Change Package modal) ───────────────────────────────

const PACKAGE_OPTIONS = [
  { id: "std",  name: "Standard – Single Devotee",   price: 5100, desc: "Basic puja with prasad dispatch", icon: "🙏" },
  { id: "prem", name: "Premium – Family (up to 4)",  price: 7100, desc: "Extended puja + 2 priests + HD live", icon: "✨" },
  { id: "elite",name: "Elite – Extended Family",     price: 11000, desc: "Grand puja + 4 priests + HD stream + express prasad", icon: "👑" },
];

// ─── MODAL OVERLAY WRAPPER ────────────────────────────────────────────────────

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {children}
    </div>
  );
}

// ─── CANCEL MODAL ─────────────────────────────────────────────────────────────

function CancelModal({ order, onClose, onSuccess }: { order: StoredOrder; onClose: () => void; onSuccess: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  const handleCancel = () => {
    setConfirming(true);
    setTimeout(() => {
      cancelOrder(order.orderId);
      setConfirming(false);
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    }, 800);
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b" style={{ borderColor: "#FEE2E2", backgroundColor: "#FFF5F5" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#FEE2E2" }}>
                <XCircle size={20} style={{ color: "#DC2626" }} />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800">Cancel Booking</p>
                <p className="text-xs text-gray-400">{order.orderId}</p>
              </div>
            </div>
            <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
          </div>
        </div>
        <div className="px-6 py-5">
          {done ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-semibold text-gray-800">Booking Cancelled</p>
              <p className="text-xs text-gray-500 mt-1">Refund will be processed in 5–7 business days</p>
            </div>
          ) : (
            <>
              <div className="rounded-xl p-4 mb-4 border" style={{ backgroundColor: "#FFF0E9", borderColor: "#FBCFB8" }}>
                <p className="text-sm font-semibold text-gray-800">{order.pujaName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{order.date} · {order.time} · {order.packageName}</p>
              </div>
              <div className="rounded-xl p-3 mb-5 border flex gap-2.5" style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA" }}>
                <AlertTriangle size={15} style={{ color: "#DC2626", flexShrink: 0 }} className="mt-0.5" />
                <div className="text-xs text-red-700 space-y-1">
                  <p>• Cancellation within 24 hours of puja is <strong>non-refundable</strong>.</p>
                  <p>• Cancellations made 48+ hours before receive a full refund.</p>
                  <p>• Refunds are credited to your original payment method.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold border"
                  style={{ borderColor: "#FBCFB8", color: "#C05621" }}
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancel}
                  disabled={confirming}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#DC2626", opacity: confirming ? 0.7 : 1 }}
                >
                  {confirming ? <><RefreshCw size={14} className="animate-spin" /> Cancelling…</> : "Yes, Cancel"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}

// ─── RESCHEDULE MODAL ────────────────────────────────────────────────────────

const RESCHEDULE_SLOTS = [
  { date: "2026-06-01", label: "Sun, 1 Jun", note: "Amavasya • Auspicious", times: ["05:30 AM","07:00 AM","02:00 PM","04:00 PM"] },
  { date: "2026-06-08", label: "Mon, 8 Jun", note: "Nag Panchami • Auspicious", times: ["06:00 AM","08:30 AM","10:00 AM","03:00 PM","05:00 PM"] },
  { date: "2026-06-15", label: "Mon, 15 Jun", note: "Shravan Somvar", times: ["06:00 AM","08:00 AM","10:30 AM","02:00 PM","04:00 PM"] },
  { date: "2026-06-22", label: "Mon, 22 Jun", note: "Ekadashi", times: ["07:00 AM","09:00 AM","11:30 AM","03:00 PM"] },
];

function RescheduleModal({ order, onClose, onSuccess }: { order: StoredOrder; onClose: () => void; onSuccess: () => void }) {
  const [selDate, setSelDate] = useState("");
  const [selTime, setSelTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const selectedSlot = RESCHEDULE_SLOTS.find((s) => s.date === selDate);

  const handleSave = () => {
    if (!selDate || !selTime) return;
    setSaving(true);
    setTimeout(() => {
      updateOrder(order.orderId, {
        date: selectedSlot?.label ?? selDate,
        dateISO: selDate,
        time: selTime,
        rescheduleCount: (order.rescheduleCount ?? 0) + 1,
      });
      setSaving(false);
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    }, 800);
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b" style={{ borderColor: "#FBCFB8", backgroundColor: "#FFFBF5" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#FFF0E9" }}>
                <RefreshCw size={18} style={{ color: "#E77237" }} />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800">Reschedule Puja</p>
                <p className="text-xs text-gray-400">Current: {order.date} · {order.time}</p>
              </div>
            </div>
            <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
          </div>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {done ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">📅</div>
              <p className="font-semibold text-gray-800">Rescheduled Successfully!</p>
              <p className="text-xs text-gray-500 mt-1">New date: {selectedSlot?.label} · {selTime}</p>
            </div>
          ) : (
            <>
              {order.rescheduleCount && order.rescheduleCount >= 2 ? (
                <div className="rounded-xl p-3 mb-4 border flex gap-2" style={{ backgroundColor: "#FFFBEB", borderColor: "#FCD34D" }}>
                  <AlertTriangle size={14} style={{ color: "#D97706", flexShrink: 0 }} className="mt-0.5" />
                  <p className="text-xs text-yellow-800">You have already rescheduled this puja {order.rescheduleCount} time(s). Further reschedules may incur a ₹200 fee.</p>
                </div>
              ) : null}

              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Select New Date</p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {RESCHEDULE_SLOTS.map((s) => (
                  <button
                    key={s.date}
                    onClick={() => { setSelDate(s.date); setSelTime(""); }}
                    className="rounded-xl p-3 text-left border-2 transition-all"
                    style={{
                      borderColor: selDate === s.date ? "#E77237" : "#FBCFB8",
                      backgroundColor: selDate === s.date ? "#FFF0E9" : "white",
                    }}
                  >
                    <p className="text-xs font-semibold text-gray-800">{s.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.note}</p>
                  </button>
                ))}
              </div>

              {selectedSlot && (
                <>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Select Time Slot</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {selectedSlot.times.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelTime(t)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all"
                        style={{
                          borderColor: selTime === t ? "#E77237" : "#FBCFB8",
                          backgroundColor: selTime === t ? "#E77237" : "white",
                          color: selTime === t ? "white" : "#374151",
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <button
                onClick={handleSave}
                disabled={!selDate || !selTime || saving}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity"
                style={{
                  backgroundColor: "#E77237",
                  opacity: (!selDate || !selTime || saving) ? 0.5 : 1,
                }}
              >
                {saving ? <><RefreshCw size={14} className="animate-spin" />Saving…</> : "Confirm Reschedule"}
              </button>
            </>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}

// ─── EDIT BIRTH DETAILS MODAL ─────────────────────────────────────────────────

function EditBirthDetailsModal({ order, onClose, onSuccess }: { order: StoredOrder; onClose: () => void; onSuccess: () => void }) {
  const [members, setMembers] = useState<OrderMember[]>(
    order.members?.length ? order.members : [{ name: order.devotee }]
  );
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const update = (idx: number, field: keyof OrderMember, val: string) => {
    setMembers((prev) => prev.map((m, i) => i === idx ? { ...m, [field]: val } : m));
  };
  const addMember = () => setMembers((prev) => [...prev, { name: "" }]);
  const removeMember = (idx: number) => setMembers((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      updateOrder(order.orderId, { members });
      setSaving(false);
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    }, 800);
  };

  const fieldClass = "w-full border rounded-lg px-3 py-2 text-sm outline-none bg-white text-gray-800 placeholder-gray-400 transition-all focus:border-orange-400";
  const fieldStyle = { borderColor: "#E5E7EB" };
  const labelClass = "text-xs font-medium text-gray-500 mb-1 block";

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b" style={{ borderColor: "#FBCFB8", backgroundColor: "#FFFBF5" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#FFF0E9" }}>
                <Users size={18} style={{ color: "#E77237" }} />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800">Edit Birth Details</p>
                <p className="text-xs text-gray-400">{order.pujaName}</p>
              </div>
            </div>
            <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
          </div>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-5">
          {done ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-semibold text-gray-800">Details Updated!</p>
              <p className="text-xs text-gray-500 mt-1">Birth details saved for Sankalp</p>
            </div>
          ) : (
            <>
              <div className="rounded-xl p-3 border flex gap-2" style={{ backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }}>
                <Info size={14} style={{ color: "#3B82F6", flexShrink: 0 }} className="mt-0.5" />
                <p className="text-xs text-blue-700">Birth details are used only for the Sankalp (sacred declaration) during the puja. This information is kept strictly private.</p>
              </div>

              {members.map((m, idx) => (
                <div key={idx} className="border rounded-2xl p-4" style={{ borderColor: "#FBCFB8" }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      {idx === 0 ? "Primary Devotee" : `Member ${idx + 1}`}
                    </p>
                    {idx > 0 && (
                      <button onClick={() => removeMember(idx)} className="text-xs text-red-400 hover:text-red-600">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Full Name *</label>
                      <input className={fieldClass} style={fieldStyle} value={m.name} onChange={(e) => update(idx, "name", e.target.value)} placeholder="e.g. Ramesh Kumar" />
                    </div>
                    <div>
                      <label className={labelClass}>Date of Birth</label>
                      <input type="date" className={fieldClass} style={fieldStyle} value={m.dob || ""} onChange={(e) => update(idx, "dob", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Gotra</label>
                      <input className={fieldClass} style={fieldStyle} value={m.gotra || ""} onChange={(e) => update(idx, "gotra", e.target.value)} placeholder="e.g. Kashyapa" />
                    </div>
                    <div>
                      <label className={labelClass}>Nakshatra (Birth Star)</label>
                      <input className={fieldClass} style={fieldStyle} value={m.nakshatra || ""} onChange={(e) => update(idx, "nakshatra", e.target.value)} placeholder="e.g. Rohini" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Rashi (Moon Sign)</label>
                      <input className={fieldClass} style={fieldStyle} value={m.rashi || ""} onChange={(e) => update(idx, "rashi", e.target.value)} placeholder="e.g. Vrishabha" />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addMember}
                className="w-full py-2.5 rounded-xl text-sm font-medium border-2 border-dashed flex items-center justify-center gap-2"
                style={{ borderColor: "#FBCFB8", color: "#C05621", backgroundColor: "#FFFBF5" }}
              >
                + Add Another Member
              </button>

              <button
                onClick={handleSave}
                disabled={saving || members.some((m) => !m.name.trim())}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: "#E77237", opacity: saving ? 0.7 : 1 }}
              >
                {saving ? <><RefreshCw size={14} className="animate-spin" />Saving…</> : "Save Birth Details"}
              </button>
            </>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}

// ─── CHANGE PACKAGE MODAL ────────────────────────────────────────────────────

function ChangePackageModal({ order, onClose, onSuccess }: { order: StoredOrder; onClose: () => void; onSuccess: () => void }) {
  const [selPkg, setSelPkg] = useState(PACKAGE_OPTIONS.find((p) => p.name === order.packageName)?.id ?? "std");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const selectedPkg = PACKAGE_OPTIONS.find((p) => p.id === selPkg)!;
  const diff = selectedPkg.price - order.packagePrice;

  const handleSave = () => {
    if (selectedPkg.name === order.packageName) { onClose(); return; }
    setSaving(true);
    setTimeout(() => {
      const newGst = Math.round(selectedPkg.price * 0.09);
      updateOrder(order.orderId, {
        packageName: selectedPkg.name,
        packagePrice: selectedPkg.price,
        gst: newGst,
        total: selectedPkg.price + order.addonTotal - order.couponDiscount + newGst,
      });
      setSaving(false);
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    }, 800);
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b" style={{ borderColor: "#FBCFB8", backgroundColor: "#FFFBF5" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#FFF0E9" }}>
                <RotateCcw size={18} style={{ color: "#E77237" }} />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800">Change Package</p>
                <p className="text-xs text-gray-400">Current: {order.packageName}</p>
              </div>
            </div>
            <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
          </div>
        </div>
        <div className="px-6 py-5 space-y-3">
          {done ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">✨</div>
              <p className="font-semibold text-gray-800">Package Updated!</p>
              <p className="text-xs text-gray-500 mt-1">New package: {selectedPkg.name}</p>
            </div>
          ) : (
            <>
              {PACKAGE_OPTIONS.map((pkg) => {
                const isActive = pkg.id === selPkg;
                const priceDiff = pkg.price - order.packagePrice;
                return (
                  <button
                    key={pkg.id}
                    onClick={() => setSelPkg(pkg.id)}
                    className="w-full rounded-xl p-4 text-left border-2 transition-all"
                    style={{
                      borderColor: isActive ? "#E77237" : "#FBCFB8",
                      backgroundColor: isActive ? "#FFF0E9" : "white",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{pkg.icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{pkg.name}</p>
                          <p className="text-xs text-gray-400">{pkg.desc}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-sm font-bold" style={{ color: "#C05621" }}>₹{pkg.price.toLocaleString("en-IN")}</p>
                        {pkg.name !== order.packageName && priceDiff !== 0 && (
                          <p className="text-xs" style={{ color: priceDiff > 0 ? "#DC2626" : "#059669" }}>
                            {priceDiff > 0 ? `+₹${priceDiff.toLocaleString("en-IN")}` : `-₹${Math.abs(priceDiff).toLocaleString("en-IN")}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

              {selectedPkg.name !== order.packageName && diff > 0 && (
                <div className="rounded-xl p-3 border flex gap-2" style={{ backgroundColor: "#FFFBEB", borderColor: "#FCD34D" }}>
                  <Info size={14} style={{ color: "#D97706", flexShrink: 0 }} className="mt-0.5" />
                  <p className="text-xs text-yellow-800">An additional ₹{diff.toLocaleString("en-IN")} will be charged to your original payment method.</p>
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 mt-2"
                style={{ backgroundColor: "#E77237", opacity: saving ? 0.7 : 1 }}
              >
                {saving ? <><RefreshCw size={14} className="animate-spin" />Saving…</> : "Confirm Package Change"}
              </button>
            </>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}

// ─── STATUS STEPPER ──────────────────────────────────────────────────────────

function StatusStepper({ status }: { status: OrderStatus }) {
  if (status === "cancelled") return (
    <div className="flex items-center gap-2 py-3">
      <span className="text-xl">❌</span>
      <p className="text-sm font-semibold text-red-500">Booking Cancelled</p>
    </div>
  );

  const idx = getStageIndex(status);
  return (
    <div className="w-full">
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-center w-full">
        {PUJA_STAGES.map((stage, i) => {
          const isDone = i < idx;
          const isCurrent = i === idx;
          const isPending = i > idx;
          return (
            <div key={stage.key} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all"
                  style={{
                    backgroundColor: isDone ? "#E77237" : isCurrent ? stage.color : "#F3F4F6",
                    border: `2px solid ${isDone ? "#E77237" : isCurrent ? stage.color : "#E5E7EB"}`,
                    boxShadow: isCurrent ? `0 0 0 3px ${stage.color}22` : "none",
                  }}
                >
                  {isDone ? (
                    <CheckCircle2 size={16} className="text-white" />
                  ) : (
                    <span style={{ fontSize: "14px" }}>{stage.icon}</span>
                  )}
                </div>
                <p
                  className="text-xs mt-1.5 text-center w-16 leading-tight"
                  style={{
                    color: isCurrent ? stage.color : isDone ? "#6B7280" : "#9CA3AF",
                    fontWeight: isCurrent ? 700 : isDone ? 500 : 400,
                  }}
                >
                  {stage.short}
                </p>
              </div>
              {i < PUJA_STAGES.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-1 rounded-full transition-all"
                  style={{ backgroundColor: i < idx ? "#E77237" : "#E5E7EB" }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: compact with current stage label */}
      <div className="sm:hidden">
        <div className="flex items-center gap-1.5 mb-2">
          {PUJA_STAGES.map((stage, i) => {
            const isDone = i <= idx;
            return (
              <div
                key={stage.key}
                className="flex-1 h-1.5 rounded-full transition-all"
                style={{ backgroundColor: isDone ? "#E77237" : "#E5E7EB" }}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{PUJA_STAGES[idx].icon}</span>
            <span className="text-xs font-semibold" style={{ color: PUJA_STAGES[idx].color }}>
              {PUJA_STAGES[idx].label}
            </span>
          </div>
          <span className="text-xs text-gray-400">Step {idx + 1} of 5</span>
        </div>
      </div>
    </div>
  );
}

// ─── VIDEO LINK SECTION ───────────────────────────────────────────────────────

function VideoLinkSection({ order }: { order: StoredOrder }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const canJoin = canJoinPuja(order);
  const countdown = getJoinCountdown(order);
  const isCompleted = order.status === "completed";
  const isLive = order.status === "live";

  if (!order.videoLink) return null;

  const isMeet = order.videoLink.includes("meet.google");

  return (
    <div
      className="rounded-2xl p-4 border"
      style={{
        background: isLive ? "linear-gradient(135deg, #FFF0E9 0%, #FEE2E2 100%)" : "linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)",
        borderColor: isLive ? "#FBCFB8" : "#BFDBFE",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: isLive ? "#FFF0E9" : "#DBEAFE" }}
        >
          {isMeet ? <span className="text-lg">📹</span> : <Video size={18} style={{ color: isLive ? "#DC2626" : "#3B82F6" }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-800">
              {isMeet ? "Google Meet" : "Zoom"} {isLive ? "— 🔴 Live Now" : isCompleted ? "Recording" : "Link"}
            </p>
            {isLive && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold animate-pulse" style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}>
                LIVE
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{order.videoLink}</p>

          {isCompleted ? (
            <div className="mt-2 rounded-xl p-3 border" style={{ backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }}>
              <p className="text-xs text-green-700">
                🎬 Your puja recording will be available within <strong>24 hours</strong> of completion. The link above will be updated once it's ready.
              </p>
            </div>
          ) : countdown ? (
            <div className="mt-2 flex items-center gap-1.5">
              <Clock size={12} style={{ color: "#6B7280" }} />
              <p className="text-xs text-gray-500">{countdown} — Join button activates 30 min before</p>
            </div>
          ) : null}

          <div className="flex gap-2 mt-3">
            <a
              href={canJoin ? order.videoLink : undefined}
              target="_blank"
              rel="noopener noreferrer"
              onClick={!canJoin ? (e) => e.preventDefault() : undefined}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all"
              style={{
                background: canJoin
                  ? isLive ? "linear-gradient(135deg, #DC2626, #B91C1C)" : "linear-gradient(135deg, #3B82F6, #2563EB)"
                  : "#D1D5DB",
                cursor: canJoin ? "pointer" : "not-allowed",
                pointerEvents: canJoin ? "auto" : "none",
              }}
            >
              {isLive ? <Play size={11} /> : <ExternalLink size={11} />}
              {canJoin ? (isLive ? "Join Live" : isCompleted ? "View Recording" : "Join Puja") : "Not yet available"}
            </a>
            {canJoin && (
              <button
                onClick={() => { navigator.clipboard?.writeText(order.videoLink!); }}
                className="px-3 py-2 rounded-xl text-xs border font-medium"
                style={{ borderColor: "#BFDBFE", color: "#3B82F6" }}
              >
                Copy Link
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ORDER CARD ───────────────────────────────────────────────────────────────

type ModalType = "cancel" | "reschedule" | "editBirth" | "changePackage";

function OrderCard({
  order,
  isExpanded,
  onToggle,
  onRefresh,
  onViewInvoice,
}: {
  order: StoredOrder;
  isExpanded: boolean;
  onToggle: () => void;
  onRefresh: () => void;
  onViewInvoice: () => void;
}) {
  const [modal, setModal] = useState<ModalType | null>(null);
  const stageIdx = getStageIndex(order.status);
  const actionsEnabled = order.status !== "cancelled" && stageIdx <= 1;
  const showVideoLink = ["video_updated", "live", "completed"].includes(order.status);
  const isCompleted = order.status === "completed";
  const isCancelled = order.status === "cancelled";
  const badge = STATUS_BADGE[order.status] ?? STATUS_BADGE.booked;
  const bookingDate = new Date(order.bookingTimestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const closeModal = () => setModal(null);
  const handleSuccess = () => { closeModal(); onRefresh(); };

  const ACTION_BTNS = [
    {
      id: "reschedule" as ModalType,
      icon: <RefreshCw size={13} />,
      label: "Reschedule",
      color: "#3B82F6",
      bg: "#EFF6FF",
      border: "#BFDBFE",
    },
    {
      id: "editBirth" as ModalType,
      icon: <Users size={13} />,
      label: "Edit Birth Details",
      color: "#7C3AED",
      bg: "#EDE9FE",
      border: "#DDD6FE",
    },
    {
      id: "changePackage" as ModalType,
      icon: <RotateCcw size={13} />,
      label: "Change Package",
      color: "#059669",
      bg: "#ECFDF5",
      border: "#A7F3D0",
    },
    {
      id: "cancel" as ModalType,
      icon: <XCircle size={13} />,
      label: "Cancel",
      color: "#DC2626",
      bg: "#FEF2F2",
      border: "#FECACA",
    },
  ];

  return (
    <>
      {/* ── Modal layer ─────────────────────────────────────── */}
      {modal === "cancel"        && <CancelModal order={order} onClose={closeModal} onSuccess={handleSuccess} />}
      {modal === "reschedule"    && <RescheduleModal order={order} onClose={closeModal} onSuccess={handleSuccess} />}
      {modal === "editBirth"     && <EditBirthDetailsModal order={order} onClose={closeModal} onSuccess={handleSuccess} />}
      {modal === "changePackage" && <ChangePackageModal order={order} onClose={closeModal} onSuccess={handleSuccess} />}

      <div
        className="bg-white rounded-2xl border overflow-hidden transition-all"
        style={{ borderColor: isExpanded ? "#E77237" : "#FBCFB8", boxShadow: isExpanded ? "0 4px 24px rgba(231,114,55,0.12)" : "0 1px 4px rgba(0,0,0,0.05)" }}
      >
        {/* ── Card header ──────────────────────────────────── */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-orange-50/30 text-left"
          style={{ backgroundColor: isExpanded ? "#FFFBF5" : "white", borderBottom: isExpanded ? "1px solid #FBCFB8" : "none" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #FFF0E9, #FDBA74)" }}
            >
              🙏
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{order.pujaName}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                <Clock size={10} style={{ color: "#E77237" }} />
                {order.date} · {order.time}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0 ml-3">
            <span
              className="text-xs px-2.5 py-1 rounded-full font-semibold hidden sm:inline-flex items-center gap-1"
              style={{ backgroundColor: badge.bg, color: badge.text }}
            >
              {badge.label}
            </span>
            <span className="text-xs font-bold hidden sm:block" style={{ color: "#C05621" }}>
              ₹{order.total.toLocaleString("en-IN")}
            </span>
            {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </div>
        </button>

        {/* ── Compact info strip (always visible) ────────── */}
        <div className="px-5 pb-3 pt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-xs text-gray-400 font-mono">{order.orderId}</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-500">{order.packageName}</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold sm:hidden"
              style={{ backgroundColor: badge.bg, color: badge.text }}
            >
              {badge.label}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-bold sm:hidden" style={{ color: "#C05621" }}>
              ₹{order.total.toLocaleString("en-IN")}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onViewInvoice(); }}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-semibold border"
              style={{ borderColor: "#FBCFB8", color: "#C05621", backgroundColor: "white" }}
            >
              <FileText size={11} /> Invoice
            </button>
          </div>
        </div>

        {/* ── Compact stepper (always visible) ──────────── */}
        {!isCancelled && (
          <div className="px-5 pb-4">
            <div className="flex items-center gap-1.5">
              {PUJA_STAGES.map((s, i) => (
                <div key={s.key} className="flex-1 flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0 transition-all"
                    style={{
                      backgroundColor: i < stageIdx ? "#E77237" : i === stageIdx ? s.color : "#E5E7EB",
                      transform: i === stageIdx ? "scale(1.4)" : "scale(1)",
                    }}
                  />
                  {i < PUJA_STAGES.length - 1 && (
                    <div className="flex-1 h-px" style={{ backgroundColor: i < stageIdx ? "#E77237" : "#E5E7EB" }} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs mt-1.5 font-medium" style={{ color: PUJA_STAGES[stageIdx]?.color ?? "#6B7280" }}>
              {PUJA_STAGES[stageIdx]?.label}
            </p>
          </div>
        )}

        {isCancelled && (
          <div className="px-5 pb-4">
            <p className="text-xs text-red-400 font-medium">❌ Booking Cancelled</p>
          </div>
        )}

        {/* ── Expanded content ──────────────────────────── */}
        {isExpanded && (
          <div className="border-t px-5 py-5 space-y-5" style={{ borderColor: "#FBCFB8" }}>

            {/* Full status stepper */}
            {!isCancelled && (
              <div className="rounded-2xl p-4 border" style={{ backgroundColor: "#FAFAFA", borderColor: "#F3F4F6" }}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Puja Progress</p>
                <StatusStepper status={order.status} />
              </div>
            )}

            {/* Puja details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Puja Date", value: order.date, icon: "📅" },
                { label: "Time", value: order.time, icon: "🕐" },
                { label: "Package", value: order.packageName.split(" – ")[0], icon: "📦" },
                { label: "Primary Devotee", value: order.devotee, icon: "👤" },
              ].map((f) => (
                <div key={f.label} className="rounded-xl p-3 border" style={{ backgroundColor: "white", borderColor: "#F3F4F6" }}>
                  <p className="text-xs text-gray-400 mb-1">{f.icon} {f.label}</p>
                  <p className="text-xs font-semibold text-gray-700 leading-snug">{f.value}</p>
                </div>
              ))}
            </div>

            {/* Member birth details */}
            {order.members && order.members.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sankalp Members</p>
                <div className="space-y-2">
                  {order.members.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border" style={{ borderColor: "#F3F4F6" }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #E77237, #C05621)" }}>
                        {m.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-700">{m.name}</p>
                        <p className="text-xs text-gray-400">
                          {[m.dob && `DOB: ${m.dob}`, m.gotra && `Gotra: ${m.gotra}`, m.nakshatra && `Nakshatra: ${m.nakshatra}`].filter(Boolean).join(" · ") || "No birth details yet"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video link (stage 3+) */}
            {showVideoLink && <VideoLinkSection order={order} />}

            {/* Stage 3+ lockout notice */}
            {!actionsEnabled && !isCancelled && !isCompleted && stageIdx >= 2 && (
              <div className="rounded-xl p-3 border flex items-start gap-2.5" style={{ backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" }}>
                <Lock size={14} style={{ color: "#9CA3AF", flexShrink: 0 }} className="mt-0.5" />
                <p className="text-xs text-gray-500">
                  Since your puja has progressed to <strong>"{PUJA_STAGES[stageIdx]?.label}"</strong>, modifications are no longer available. For urgent changes, please contact support.
                </p>
              </div>
            )}

            {/* Completed — Re-book */}
            {isCompleted && (
              <div className="rounded-2xl p-4 border" style={{ background: "linear-gradient(135deg, #F0FDF4, #ECFDF5)", borderColor: "#A7F3D0" }}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🙏</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-800 mb-0.5">Puja Completed Successfully</p>
                    <p className="text-xs text-green-600 mb-3">
                      May the blessings of this sacred ritual bring peace, prosperity, and well-being to your family.
                    </p>
                    <a
                      href="/"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                      style={{ background: "linear-gradient(135deg, #059669, #047857)" }}
                    >
                      <RotateCcw size={12} /> Re-book This Puja
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons (stage 1 & 2 only) */}
            {actionsEnabled && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">Manage Booking</p>
                <div className="flex flex-wrap gap-2">
                  {ACTION_BTNS.map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setModal(btn.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all hover:shadow-sm"
                      style={{ color: btn.color, backgroundColor: btn.bg, borderColor: btn.border }}
                    >
                      {btn.icon} {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Booking meta */}
            <div className="pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2" style={{ borderColor: "#F3F4F6" }}>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar size={11} /> Booked {bookingDate}
                </span>
                <span className="text-xs text-gray-400">
                  via {order.paymentMethod === "upi" ? "UPI" : order.paymentMethod === "card" ? "Card" : order.paymentMethod === "netbanking" ? "Net Banking" : "Wallet"}
                </span>
                <span className="text-xs font-mono text-gray-300">{order.transactionId}</span>
              </div>
              <button
                onClick={onViewInvoice}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-semibold text-white whitespace-nowrap self-start sm:self-auto"
                style={{ background: "linear-gradient(135deg, #E77237, #C05621)" }}
              >
                <FileText size={12} /> View Invoice <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── RECOMMENDED PUJAS ────────────────────────────────────────────────────────

function RecommendedPujas() {
  const navigate = useNavigate();
  const picks = ALL_POOJAS.slice(0, 3);
  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-800">Recommended Pujas</h2>
          <p className="text-xs text-gray-500">Popular rituals you may also like</p>
        </div>
        <button
          onClick={() => navigate("/all-pujas")}
          className="flex items-center gap-1 text-xs font-semibold"
          style={{ color: "#E77237" }}
        >
          View all <ChevronRight size={13} />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {picks.map((puja) => (
          <div
            key={puja.id}
            className="bg-white rounded-2xl border overflow-hidden cursor-pointer hover:shadow-md transition-all group"
            style={{ borderColor: "#FBCFB8" }}
            onClick={() => navigate(`/pooja/${puja.id}`)}
          >
            <div className="relative h-32 overflow-hidden">
              <img src={puja.image} alt={puja.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              {puja.tag && (
                <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full text-white font-semibold" style={{ backgroundColor: puja.tagColor ?? "#C05621" }}>
                  {puja.tag}
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold text-gray-800 leading-snug">{puja.name}</p>
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-1">
                  <Star size={10} fill="#F59E0B" stroke="none" />
                  <span className="text-xs text-gray-500">{puja.rating} ({puja.reviews})</span>
                </div>
                <span className="text-xs font-bold" style={{ color: "#C05621" }}>from ₹{puja.price.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── T&C SECTION ──────────────────────────────────────────────────────────────

const TC_ITEMS = [
  {
    q: "Cancellation & Refund Policy",
    a: "Cancellations made 48 hours or more before the scheduled puja receive a full refund. Cancellations made within 48 hours but 24 hours before receive a 50% refund. No refunds are applicable within 24 hours of the puja.",
  },
  {
    q: "Rescheduling Policy",
    a: "Up to 2 free reschedules are permitted per booking, at least 48 hours before the puja. A ₹200 rescheduling fee applies from the 3rd reschedule onwards.",
  },
  {
    q: "Video Link & Livestream",
    a: "Your Zoom/Google Meet link will be shared 12 hours before the puja. The link becomes active 30 minutes before the start time. Puja recordings are made available within 24 hours of completion and are valid for 30 days.",
  },
  {
    q: "Birth Details & Privacy",
    a: "Devotee birth details (name, date of birth, gotra, nakshatra) are collected solely for the purpose of the Sankalp during the puja ritual. This information is never shared with third parties.",
  },
  {
    q: "Prasad & Certificate Delivery",
    a: "Prasad and your digital puja certificate are dispatched after the completion of the puja. Standard delivery takes 7–10 business days across India. International shipping takes 15–21 business days.",
  },
  {
    q: "Priest & Substitution",
    a: "iMeUsWe reserves the right to substitute assigned priests in case of unavailability due to health or emergency reasons, ensuring the ritual quality is maintained at all times.",
  },
];

function TCSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="mt-10 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={16} style={{ color: "#E77237" }} />
        <h2 className="text-base font-bold text-gray-800">Terms & Conditions</h2>
      </div>
      <div className="space-y-2">
        {TC_ITEMS.map((item, i) => (
          <div key={i} className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#FBCFB8" }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-orange-50/30 transition-colors"
            >
              <p className="text-sm font-medium text-gray-700">{item.q}</p>
              {open === i ? <ChevronUp size={15} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={15} className="text-gray-400 flex-shrink-0" />}
            </button>
            {open === i && (
              <div className="px-4 pb-4 border-t" style={{ borderColor: "#FEF3C7" }}>
                <p className="text-xs text-gray-500 leading-relaxed pt-3">{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export function OrderHistoryPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<StoredOrder[]>(() => getOrders());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [seeding, setSeeding] = useState(false);

  const refreshOrders = useCallback(() => setOrders(getOrders()), []);

  const years = useMemo(() => {
    const ys = new Set(orders.map((o) => new Date(o.bookingTimestamp).getFullYear().toString()));
    return Array.from(ys).sort((a, b) => Number(b) - Number(a));
  }, [orders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (query.trim()) {
        const q = query.toLowerCase();
        if (
          !o.pujaName.toLowerCase().includes(q) &&
          !o.packageName.toLowerCase().includes(q) &&
          !o.orderId.toLowerCase().includes(q) &&
          !o.devotee.toLowerCase().includes(q)
        ) return false;
      }
      if (monthFilter) {
        const d = new Date(o.bookingTimestamp);
        const label = `${ALL_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
        if (label !== monthFilter) return false;
      }
      if (yearFilter) {
        const y = new Date(o.bookingTimestamp).getFullYear().toString();
        if (y !== yearFilter) return false;
      }
      return true;
    });
  }, [orders, query, monthFilter, yearFilter]);

  const clearFilters = () => { setQuery(""); setMonthFilter(""); setYearFilter(""); };
  const hasFilters = !!query || !!monthFilter || !!yearFilter;

  const handleSeedDemo = () => {
    setSeeding(true);
    setTimeout(() => {
      seedDemoOrders();
      refreshOrders();
      setSeeding(false);
    }, 600);
  };

  const activeOrders  = orders.filter((o) => !["completed", "cancelled"].includes(o.status)).length;
  const totalSpent    = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div style={{ backgroundColor: "#F8F7FA", fontFamily: "'Public Sans', sans-serif", minHeight: "100vh" }}>

      {/* ── PAGE HEADER ───────────────────────────────────────────────── */}
      <div
        className="py-8 px-4 sm:px-6 lg:px-8 border-b"
        style={{ background: "linear-gradient(135deg, #FFF0E9 0%, #F8F7FA 100%)", borderColor: "#FBCFB8" }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #E77237, #C05621)" }}
            >
              📋
            </div>
            <div>
              <h1 style={{ color: "#1C1917", fontSize: "clamp(1.3rem, 3vw, 1.8rem)", fontWeight: 700, lineHeight: 1.2 }}>
                My Puja Orders
              </h1>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>Track your bookings, manage details & view invoices</p>
            </div>
          </div>

          {orders.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 ml-12">
              {[
                { label: `${orders.length} Booking${orders.length !== 1 ? "s" : ""}`, icon: "🙏" },
                { label: `₹${totalSpent.toLocaleString("en-IN")} Total`, icon: "💰" },
                { label: `${activeOrders} Active`, icon: "🔴" },
                { label: `${orders.filter((o) => o.status === "completed").length} Completed`, icon: "✅" },
              ].map((s) => (
                <span
                  key={s.label}
                  className="text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ backgroundColor: "white", color: "#7C3018", border: "1px solid #FBCFB8" }}
                >
                  {s.icon} {s.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {orders.length === 0 ? (
          /* ── EMPTY STATE ────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-5"
              style={{ backgroundColor: "#FFF0E9", border: "2px solid #FBCFB8" }}
            >
              <Package size={36} style={{ color: "#E77237", opacity: 0.7 }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Pujas Booked Yet</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed mb-6">
              You haven't booked any pujas with iMeUsWe yet. Explore our catalogue and book your first sacred ritual today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={() => navigate("/")}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 justify-center"
                style={{ background: "linear-gradient(135deg, #E77237, #C05621)" }}
              >
                🙏 Browse Pujas <ChevronRight size={14} />
              </button>
              <button
                onClick={handleSeedDemo}
                disabled={seeding}
                className="px-5 py-2.5 rounded-xl text-sm font-medium border flex items-center gap-2 justify-center transition-all"
                style={{ borderColor: "#FBCFB8", color: "#C05621", backgroundColor: "white" }}
              >
                {seeding ? <><RefreshCw size={13} className="animate-spin" /> Loading…</> : "✨ Load Sample Bookings"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
              {[
                { icon: "⭐", title: "Verified Pandits", desc: "All rituals by certified priests" },
                { icon: "📹", title: "Live Stream", desc: "Watch your puja in real time" },
                { icon: "🚚", title: "Prasad Delivery", desc: "Shipped across India & abroad" },
              ].map((c) => (
                <div key={c.title} className="rounded-2xl p-4 text-center border" style={{ backgroundColor: "white", borderColor: "#FBCFB8" }}>
                  <div className="text-2xl mb-2">{c.icon}</div>
                  <p className="text-xs font-semibold text-gray-700 mb-0.5">{c.title}</p>
                  <p className="text-xs text-gray-400">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

        ) : (
          <>
            {/* ── SEARCH + FILTER BAR ─────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div
                className="flex items-center gap-2.5 flex-1 px-4 py-2.5 rounded-xl border-2 bg-white transition-all"
                style={{ borderColor: "#FBCFB8" }}
              >
                <Search size={16} style={{ color: "#9CA3AF" }} className="flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search by puja, order ID or devotee…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                  onFocus={(e) => (e.currentTarget.parentElement!.style.borderColor = "#E77237")}
                  onBlur={(e) => (e.currentTarget.parentElement!.style.borderColor = "#FBCFB8")}
                />
                {query && <button onClick={() => setQuery("")}><X size={14} className="text-gray-400" /></button>}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border bg-white" style={{ borderColor: "#FBCFB8" }}>
                  <Calendar size={14} style={{ color: "#9CA3AF" }} />
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="text-sm outline-none bg-transparent text-gray-600 cursor-pointer pr-1"
                  >
                    <option value="">All months</option>
                    {ALL_MONTHS.flatMap((m) =>
                      [2025, 2026, 2027].map((y) => (
                        <option key={`${m}-${y}`} value={`${m} ${y}`}>{m} {y}</option>
                      ))
                    )}
                  </select>
                </div>

                {years.length > 1 && (
                  <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border bg-white" style={{ borderColor: "#FBCFB8" }}>
                    <select
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      className="text-sm outline-none bg-transparent text-gray-600 cursor-pointer"
                    >
                      <option value="">All years</option>
                      {years.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                )}

                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border font-medium"
                    style={{ borderColor: "#EF4444", color: "#EF4444", backgroundColor: "#FEF2F2" }}
                  >
                    <X size={11} /> Clear
                  </button>
                )}

                <button
                  onClick={handleSeedDemo}
                  disabled={seeding}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border font-medium transition-all hover:bg-orange-50"
                  style={{ borderColor: "#FBCFB8", color: "#E77237", backgroundColor: "white" }}
                  title="Load sample orders to preview all statuses"
                >
                  {seeding ? <RefreshCw size={11} className="animate-spin" /> : "✨"} Demo
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              <span className="font-medium text-gray-800">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "booking" : "bookings"} found{hasFilters && " (filtered)"}
            </p>

            {/* ── ORDER CARDS ──────────────────────────────────────── */}
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-sm font-medium text-gray-700 mb-1">No matching orders</p>
                <p className="text-xs text-gray-400 mb-4">Try adjusting your search or filter</p>
                <button onClick={clearFilters} className="text-sm underline" style={{ color: "#E77237" }}>
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((order) => (
                  <OrderCard
                    key={order.orderId}
                    order={order}
                    isExpanded={expandedId === order.orderId}
                    onToggle={() => setExpandedId(expandedId === order.orderId ? null : order.orderId)}
                    onRefresh={refreshOrders}
                    onViewInvoice={() => navigate("/booking/invoice", { state: order })}
                  />
                ))}
              </div>
            )}

            {/* ── RECOMMENDED PUJAS ────────────────────────────────── */}
            <RecommendedPujas />

            {/* ── T&C ─────────────────────────────────────────────── */}
            <TCSection />
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
