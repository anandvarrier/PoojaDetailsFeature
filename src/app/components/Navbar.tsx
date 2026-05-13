import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { ShoppingCart, Menu, X, User, Bell, History, Mail, Lock, Eye, EyeOff, Phone } from "lucide-react";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleProfileClick = () => {
    if (isLoggedIn) {
      setProfileDropdown(!profileDropdown);
    } else {
      setAuthModal(true);
      setAuthTab("login");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setAuthModal(false);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setAuthModal(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setProfileDropdown(false);
  };

  return (
    <>
      <nav
        className="sticky top-0 z-50 bg-white border-b"
        style={{ borderColor: "#FBCFB8", boxShadow: "0 1px 8px rgba(0,0,0,0.07)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ── */}
            <div
              className="flex items-center gap-2.5 cursor-pointer flex-shrink-0"
              onClick={() => navigate("/")}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: "#E77237" }}
              >
                🕉️
              </div>
              <div>
                <p
                  className="leading-tight"
                  style={{
                    fontFamily: "'Public Sans', sans-serif",
                    color: "#C05621",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                  }}
                >
                  iMeUsWe Puja
                </p>
                <p className="text-xs leading-none" style={{ color: "#E77237" }}>
                  Sacred Rituals, Pure Faith
                </p>
              </div>
            </div>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* All Pujas CTA */}
              <button
                onClick={() => navigate("/all-pujas")}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: "#E77237", color: "white" }}
              >
                All Pujas
              </button>

              {/* Order History */}
              <button
                onClick={() => navigate("/order-history")}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm font-medium transition-all hover:bg-orange-50"
                style={{ borderColor: "#FBCFB8", color: "#C05621" }}
                title="Order History"
              >
                <History size={16} />
                <span className="hidden lg:inline">Orders</span>
              </button>

              {/* Notification bell */}
              <button className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-gray-500 hover:bg-orange-50 transition-colors relative">
                <Bell size={18} />
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#ef4444" }}
                />
              </button>

              {/* Cart */}
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm font-medium transition-all hover:bg-orange-50 relative"
                style={{ borderColor: "#FBCFB8", color: "#C05621" }}
              >
                <ShoppingCart size={16} />
                <span className="hidden sm:inline">Cart</span>
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs text-white flex items-center justify-center font-bold"
                  style={{ backgroundColor: "#E77237" }}
                >
                  0
                </span>
              </button>

              {/* Profile icon — merges Login & Sign Up */}
              <div className="hidden sm:block relative">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm font-medium transition-all hover:bg-orange-50"
                  style={{ borderColor: "#FBCFB8", color: "#C05621" }}
                  title={isLoggedIn ? "Profile" : "Login / Sign Up"}
                >
                  <User size={16} />
                  <span className="hidden lg:inline">{isLoggedIn ? "Profile" : "Sign In"}</span>
                </button>

                {/* Profile dropdown (logged in) */}
                {isLoggedIn && profileDropdown && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border shadow-xl z-50 overflow-hidden"
                    style={{ borderColor: "#FBCFB8" }}
                  >
                    <div className="px-4 py-3 border-b" style={{ borderColor: "#FFF0E9", backgroundColor: "#FFF7F2" }}>
                      <p className="text-sm font-semibold text-gray-800">Ramesh Subramaniam</p>
                      <p className="text-xs text-gray-400">ramesh@example.com</p>
                    </div>
                    <div className="py-1">
                      {[
                        { label: "My Orders", action: () => { navigate("/order-history"); setProfileDropdown(false); } },
                        { label: "My Profile", action: () => setProfileDropdown(false) },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={item.action}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div className="border-t py-1" style={{ borderColor: "#FFF0E9" }}>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-red-50"
                        style={{ color: "#EF4444" }}
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                className="sm:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-orange-50 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X size={20} className="text-gray-600" /> : <Menu size={20} className="text-gray-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden bg-white border-t px-4 py-4 space-y-3" style={{ borderColor: "#FBCFB8" }}>
            <button
              onClick={() => { navigate("/all-pujas"); setMenuOpen(false); }}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ backgroundColor: "#E77237" }}
            >
              🙏 Browse All Pujas
            </button>
            <button
              onClick={() => { navigate("/order-history"); setMenuOpen(false); }}
              className="w-full py-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2"
              style={{ borderColor: "#FBCFB8", color: "#C05621" }}
            >
              <History size={15} /> Order History
            </button>
            <button
              onClick={() => { setMenuOpen(false); setAuthModal(true); setAuthTab("login"); }}
              className="w-full py-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2"
              style={{ borderColor: "#E77237", color: "#E77237" }}
            >
              <User size={15} />
              {isLoggedIn ? "My Profile" : "Sign In / Create Account"}
            </button>
            <div
              className="p-3 rounded-xl text-xs text-center"
              style={{ backgroundColor: "#FFF0E9", color: "#7C3018" }}
            >
              🙏 Book pujas performed by verified pandits at India's most sacred temples
            </div>
          </div>
        )}
      </nav>

      {/* ── AUTH MODAL ── */}
      {authModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setAuthModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4 text-center" style={{ borderBottom: "1px solid #FFF0E9" }}>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mx-auto mb-3"
                style={{ backgroundColor: "#E77237" }}
              >
                🕉️
              </div>
              <h2 className="text-gray-800" style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 700, fontSize: "1.2rem" }}>
                Welcome to iMeUsWe Puja
              </h2>
              <p className="text-xs text-gray-400 mt-1">Sacred Rituals, Pure Faith</p>
              <button
                onClick={() => setAuthModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: "#FFF0E9" }}>
              {(["login", "signup"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setAuthTab(tab)}
                  className="flex-1 py-3 text-sm font-semibold transition-colors border-b-2"
                  style={{
                    borderColor: authTab === tab ? "#E77237" : "transparent",
                    color: authTab === tab ? "#E77237" : "#9CA3AF",
                  }}
                >
                  {tab === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            {/* Login Form */}
            {authTab === "login" && (
              <form onSubmit={handleLogin} className="px-6 py-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">Mobile Number or Email</label>
                  <div
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors"
                    style={{ borderColor: "#FBCFB8" }}
                  >
                    <Mail size={16} style={{ color: "#E77237" }} className="flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Enter your mobile or email"
                      className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">Password</label>
                  <div
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors"
                    style={{ borderColor: "#FBCFB8" }}
                  >
                    <Lock size={16} style={{ color: "#E77237" }} className="flex-shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="flex-shrink-0">
                      {showPassword ? <EyeOff size={15} className="text-gray-400" /> : <Eye size={15} className="text-gray-400" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="button" className="text-xs" style={{ color: "#E77237" }}>
                    Forgot password?
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                  style={{ backgroundColor: "#E77237" }}
                >
                  Sign In
                </button>
                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl border text-sm font-medium text-gray-600 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <Phone size={15} style={{ color: "#E77237" }} />
                  Continue with OTP
                </button>
                <p className="text-center text-xs text-gray-500">
                  New here?{" "}
                  <button type="button" onClick={() => setAuthTab("signup")} className="font-semibold" style={{ color: "#E77237" }}>
                    Create an account
                  </button>
                </p>
              </form>
            )}

            {/* Signup Form */}
            {authTab === "signup" && (
              <form onSubmit={handleSignup} className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1.5">First Name</label>
                    <input
                      type="text"
                      placeholder="First name"
                      className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                      style={{ borderColor: "#FBCFB8" }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1.5">Last Name</label>
                    <input
                      type="text"
                      placeholder="Last name"
                      className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                      style={{ borderColor: "#FBCFB8" }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">Mobile Number</label>
                  <div
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors"
                    style={{ borderColor: "#FBCFB8" }}
                  >
                    <Phone size={16} style={{ color: "#E77237" }} className="flex-shrink-0" />
                    <input
                      type="tel"
                      placeholder="+91 00000 00000"
                      className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">Email Address</label>
                  <div
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors"
                    style={{ borderColor: "#FBCFB8" }}
                  >
                    <Mail size={16} style={{ color: "#E77237" }} className="flex-shrink-0" />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">Password</label>
                  <div
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors"
                    style={{ borderColor: "#FBCFB8" }}
                  >
                    <Lock size={16} style={{ color: "#E77237" }} className="flex-shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="flex-shrink-0">
                      {showPassword ? <EyeOff size={15} className="text-gray-400" /> : <Eye size={15} className="text-gray-400" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                  style={{ backgroundColor: "#E77237" }}
                >
                  Create Account
                </button>
                <p className="text-center text-xs text-gray-500">
                  Already have an account?{" "}
                  <button type="button" onClick={() => setAuthTab("login")} className="font-semibold" style={{ color: "#E77237" }}>
                    Sign in
                  </button>
                </p>
                <p className="text-center text-xs text-gray-400">
                  By signing up you agree to our{" "}
                  <span className="underline cursor-pointer">Terms</span> &{" "}
                  <span className="underline cursor-pointer">Privacy Policy</span>
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Close profile dropdown on outside click */}
      {profileDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileDropdown(false)} />
      )}
    </>
  );
}
