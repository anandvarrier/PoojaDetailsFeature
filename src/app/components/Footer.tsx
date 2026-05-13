import { Phone, Mail, MapPin, Instagram, Youtube, Facebook, Twitter } from "lucide-react";
import { useNavigate } from "react-router";

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer style={{ backgroundColor: "#1C0A00", fontFamily: "'Public Sans', sans-serif" }}>
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ backgroundColor: "#E77237" }}
              >
                🕉️
              </div>
              <div>
                <p className="font-bold text-white" style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "1.1rem" }}>
                  iMeUsWe Puja
                </p>
                <p className="text-xs" style={{ color: "#F9A87A" }}>Sacred Rituals, Pure Faith</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#9CA3AF" }}>
              Connecting devotees with verified pandits across India's most sacred temples. Every ritual performed with authenticity and devotion.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, href: "#" },
                { icon: Youtube, href: "#" },
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-80"
                  style={{ backgroundColor: "#2D1200" }}
                >
                  <Icon size={15} style={{ color: "#F9A87A" }} />
                </a>
              ))}
            </div>
          </div>

          {/* Popular Pujas */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: "#F9A87A" }}>Popular Pujas</h4>
            <ul className="space-y-2.5">
              {[
                "Kaal Sarpa Dosh Puja",
                "Mangal Dosh Puja",
                "Satyanarayan Katha",
                "Lakshmi Puja",
                "Rudrabhishek",
                "Navagraha Shanti",
                "Pitra Dosh Nivaran",
                "Ganesh Puja",
              ].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => navigate("/")}
                    className="text-sm transition-colors hover:text-orange-400 text-left"
                    style={{ color: "#9CA3AF" }}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: "#F9A87A" }}>Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                "Browse All Pujas",
                "Find a Temple",
                "Instant Pujas",
                "Festival Specials",
                "Upcoming Auspicious Dates",
                "About Us",
                "How It Works",
                "Refund Policy",
                "Terms & Conditions",
              ].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => item === "Browse All Pujas" ? navigate("/all-pujas") : undefined}
                    className="text-sm transition-colors hover:text-orange-400 text-left"
                    style={{ color: item === "Browse All Pujas" ? "#F9A87A" : "#9CA3AF", fontWeight: item === "Browse All Pujas" ? 600 : 400 }}
                  >
                    {item === "Browse All Pujas" ? "→ " : ""}{item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: "#F9A87A" }}>Get in Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Phone size={15} className="flex-shrink-0 mt-0.5" style={{ color: "#F9A87A" }} />
                <div>
                  <p className="text-sm text-white">+91 98765 43210</p>
                  <p className="text-xs" style={{ color: "#9CA3AF" }}>Mon–Sat, 8 AM – 8 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={15} className="flex-shrink-0 mt-0.5" style={{ color: "#F9A87A" }} />
                <div>
                  <p className="text-sm text-white">puja@imeuswe.in</p>
                  <p className="text-xs" style={{ color: "#9CA3AF" }}>Booking & queries</p>
                </div>
              </li>
            </ul>

            {/* WhatsApp CTA */}
            <button
              className="mt-5 w-full py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ backgroundColor: "#25D366" }}
            >
              <span className="text-base">💬</span>
              Chat on WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t" style={{ borderColor: "#2D1200" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: "#6B7280" }}>
            © 2026 iMeUsWe Puja. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Privacy Policy", "Terms of Use", "Cookie Policy"].map((item) => (
              <button key={item} className="text-xs transition-colors hover:text-orange-400" style={{ color: "#6B7280" }}>
                {item}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "#6B7280" }}>Payments secured by</span>
            <span className="text-xs font-semibold" style={{ color: "#F9A87A" }}>Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}