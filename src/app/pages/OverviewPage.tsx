import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Shield, Check, Lock, CreditCard, Smartphone, Building, ChevronRight, AlertCircle } from "lucide-react";
import { BookingProgress } from "../components/BookingProgress";
import { ALL_POOJAS } from "../data/pujaData";

export function OverviewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const puja = ALL_POOJAS.find((p) => p.id === id) ?? ALL_POOJAS[0];

  const [payMethod, setPayMethod] = useState("upi");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    setLoading(true);
    // Simulate Razorpay integration
    setTimeout(() => {
      setLoading(false);
      navigate("/booking/invoice");
    }, 2000);
  };

  return (
    <div style={{ backgroundColor: "#F8F7FA", fontFamily: "'Public Sans', sans-serif" }}>
      <BookingProgress currentStep={3} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <button
          className="flex items-center gap-1.5 text-sm mb-6"
          style={{ color: "#C05621" }}
          onClick={() => navigate(`/pooja/${id}/book`)}
        >
          <ChevronLeft size={16} /> Back to Schedule
        </button>

        <h1
          className="mb-1"
          style={{ fontFamily: "'Public Sans', sans-serif", color: "#1C1917", fontSize: "1.6rem", fontWeight: 700 }}
        >
          Review & Pay
        </h1>
        <p className="text-sm text-gray-500 mb-8">You're one step away from booking your sacred puja</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* Booking summary */}
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Booking Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Puja", value: puja.name },
                  { label: "Package", value: "Maha Shanti (Recommended)" },
                  { label: "Location", value: "iMeUsWe Puja Center, Bengaluru" },
                  { label: "Date & Time", value: "Mon, 11 May · 06:00 AM" },
                  { label: "Devotee", value: "Ramesh Subramaniam" },
                  { label: "Gotra", value: "Kashyap" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusions */}
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-3">What's Included</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "Sankalp (up to 3 persons)",
                  "Navagraha Puja",
                  "Nag Abhishek",
                  "Mantra Jaap (21,000 times)",
                  "Navagraha Homa",
                  "Live Video Streaming",
                  "Prasadam via courier",
                  "Puja Certificate & Report",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={13} style={{ color: "#15803D" }} className="flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Payment Method</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { id: "upi", label: "UPI", icon: Smartphone },
                  { id: "card", label: "Card", icon: CreditCard },
                  { id: "netbanking", label: "Net Banking", icon: Building },
                  { id: "wallet", label: "Wallet", icon: Lock },
                ].map(({ id: methodId, label, icon: Icon }) => (
                  <button
                    key={methodId}
                    onClick={() => setPayMethod(methodId)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium"
                    style={{
                      borderColor: payMethod === methodId ? "#C05621" : "#E5E7EB",
                      backgroundColor: payMethod === methodId ? "#FFF7ED" : "white",
                      color: payMethod === methodId ? "#C05621" : "#6B7280",
                    }}
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Razorpay note */}
              <div
                className="p-3 rounded-xl flex items-start gap-2 text-xs"
                style={{ backgroundColor: "#F0FDF4", color: "#15803D" }}
              >
                <Shield size={13} className="flex-shrink-0 mt-0.5" />
                Payment powered by <strong className="ml-0.5">Razorpay</strong> — India's most trusted payment gateway. Your details are 256-bit SSL encrypted.
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 mt-4">
                <div
                  onClick={() => setAgreed(!agreed)}
                  className="w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center cursor-pointer mt-0.5 transition-all"
                  style={{
                    borderColor: agreed ? "#C05621" : "#D1D5DB",
                    backgroundColor: agreed ? "#C05621" : "transparent",
                  }}
                >
                  {agreed && <Check size={10} className="text-white" />}
                </div>
                <p className="text-xs text-gray-500">
                  I agree to the <span style={{ color: "#C05621" }}>Terms & Conditions</span> and{" "}
                  <span style={{ color: "#C05621" }}>Cancellation Policy</span>. I understand that bookings
                  cancelled 48 hours before the puja date are eligible for 80% refund.
                </p>
              </div>
            </div>
          </div>

          {/* Right: price + pay */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border shadow-sm p-5 sticky top-28" style={{ borderColor: "#FDBA74" }}>
              <h3 className="font-semibold text-gray-800 mb-4">Price Breakdown</h3>
              <div className="space-y-2.5 text-sm">
                <PriceRow label="Maha Shanti Package" amount="₹11,000" />
                <PriceRow label="Samagri & Prasadam" amount="Included" isGreen />
                <PriceRow label="Live Stream" amount="Included" isGreen />
                <PriceRow label="Platform Fee" amount="₹0" />
                <div className="h-px bg-orange-100 my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total Payable</span>
                  <span style={{ color: "#C05621", fontFamily: "'Public Sans', sans-serif", fontSize: "1.1rem" }}>₹11,000</span>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={!agreed || loading}
                className="w-full mt-5 py-4 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                style={{
                  backgroundColor: agreed ? "#E77237" : "#D1D5DB",
                  cursor: agreed ? "pointer" : "not-allowed",
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={15} /> Pay ₹11,000 via Razorpay
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-3 mt-3">
                <span className="text-xs text-gray-400">Secured by Razorpay</span>
              </div>

              {/* Trust badges */}
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
                {[
                  { icon: Shield, text: "256-bit SSL" },
                  { icon: Check, text: "Money-back" },
                  { icon: Lock, text: "Secure Pay" },
                  { icon: Check, text: "Certified Pandits" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Icon size={11} style={{ color: "#C05621" }} />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceRow({ label, amount, isGreen }: { label: string; amount: string; isGreen?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={isGreen ? "text-green-600 font-medium" : "text-gray-700"}>{amount}</span>
    </div>
  );
}