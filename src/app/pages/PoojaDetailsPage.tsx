import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Star, MapPin, Clock, Users, Languages, ChevronRight,
  Check, Plus, Minus, Info, Play, Shield, Award,
  ChevronDown, ChevronUp, Video, Package, Truck,
  MessageCircle, UserPlus, Flame, BookOpen, Heart,
  HelpCircle, Share2, ArrowRight, X, Wifi, Monitor,
  Camera, PhoneCall, LayoutGrid
} from "lucide-react";
import { BookingProgress } from "../components/BookingProgress";
import { Footer } from "../components/Footer";
import { ALL_POOJAS, FILTER_CONFIG } from "../data/pujaData";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const GALLERY = [
  { type: "image", src: "https://images.unsplash.com/photo-1576470188704-277a8734ad62?w=900&fit=crop", label: "Havan Ritual" },
  { type: "image", src: "https://images.unsplash.com/photo-1662036955119-6d126129401d?w=900&fit=crop", label: "Pandit performing Sankalp" },
  { type: "image", src: "https://images.unsplash.com/photo-1767669573937-6367a6331dc7?w=900&fit=crop", label: "Nag Abhishek with incense" },
  { type: "image", src: "https://images.unsplash.com/photo-1761295908789-42feef309297?w=900&fit=crop", label: "Sacred samagri & thali" },
  { type: "video", src: "https://images.unsplash.com/photo-1721786838536-8e336f77bdd9?w=900&fit=crop", label: "▶  Full ritual walkthrough (3 min)" },
];

const PURPOSE = [
  {
    icon: "🐍",
    title: "Neutralise Karmic Shadows",
    desc: "The primary goal is to address the \"serpent shadow\" in a birth chart where all primary planets are trapped between Rahu and Ketu — restoring the blocked planetary flow.",
    color: "#C05621",
    bg: "#FFF0E9",
  },
  {
    icon: "🔄",
    title: "Resolve Past Karma",
    desc: "Acts as a spiritual remedy for unresolved karmic lessons related to nature, ancestors, or serpents from past lives — allowing the soul's journey to progress freely.",
    color: "#6B21A8",
    bg: "#F5F3FF",
  },
  {
    icon: "🌊",
    title: "Restore Life Flow",
    desc: "Designed to remove the persistent \"stuck\" feeling many experience — opening clear pathways for progress in career, relationships, health, and finances.",
    color: "#15803D",
    bg: "#F0FDF4",
  },
];

const BENEFITS = [
  {
    icon: "🚧",
    title: "Removes Obstacles",
    desc: "Significantly reduces or neutralises delays in marriage and career growth that have remained unexplained.",
    color: "#E77237",
    bg: "#FFF0E9",
  },
  {
    icon: "👨‍👩‍👧‍👦",
    title: "Family Harmony",
    desc: "Helps resolve unexplained estrangements within the family and difficulties in conceiving children.",
    color: "#15803D",
    bg: "#F0FDF4",
  },
  {
    icon: "🧘",
    title: "Mental Peace",
    desc: "Reduces anxiety, unexplained fears, and recurring nightmares often directly associated with this Dosha.",
    color: "#1D4ED8",
    bg: "#EFF6FF",
  },
  {
    icon: "💰",
    title: "Financial Stability",
    desc: "Protects against sudden business reversals and recurring financial losses that seem to repeat in cycles.",
    color: "#C05621",
    bg: "#FFF0E9",
  },
];

const FIVE_W_ONE_H = [
  {
    key: "who",
    question: "Who performs it?",
    icon: "👤",
    color: "#1D4ED8",
    bg: "#EFF6FF",
    answer: "Performed by Gurukul-trained Brahmin specialists with 12+ years of Vedic training, specifically for individuals whose birth charts confirm the Dosha. Each pandit is individually verified and registered with the respective temple authority.",
  },
  {
    key: "what",
    question: "What is done?",
    icon: "📿",
    color: "#7C2D12",
    bg: "#FEF3C7",
    answer: "A 10-step Vedic ritual including: Sankalpa (sacred vow in your name), Mantra Japa (Rahu-Ketu chanting), Abhishek (milk & Panchamrit offering on the Shiva Lingam), and a Havan (sacred fire) with Poornahuti as the concluding offering.",
  },
  {
    key: "when",
    question: "When is it conducted?",
    icon: "🌑",
    color: "#6B21A8",
    bg: "#F5F3FF",
    answer: "Conducted during auspicious Muhurats — Mondays, Naga Panchami, Amavasya (new moon days), or specific Nakshatras like Ashlesha and Shatabhisha. The ritual lasts 2.5 to 5 hours depending on your chosen package.",
  },
  {
    key: "where",
    question: "Where is it held?",
    icon: "🛕",
    color: "#15803D",
    bg: "#F0FDF4",
    answer: "Held at a consecrated Puja Griha or at sacred pilgrimage sites specifically empowered for serpent-dosh removal — primarily Tryambakeshwar (Maharashtra) or Sri Kalahasti (AP) or Ujjain (MP).",
  },
  {
    key: "why",
    question: "Why is it performed?",
    icon: "✨",
    color: "#C05621",
    bg: "#FFF7ED",
    answer: "To appease agitated serpent energy caused by the Rahu-Ketu planetary axis in the birth chart, and to formally release the devotee's accumulated karmic burden through Poornahuti — the final fire offering that seals the ritual's intention.",
  },
  {
    key: "how",
    question: "How is it done?",
    icon: "🔥",
    color: "#B91C1C",
    bg: "#FFF1F2",
    answer: "Using only Shuddh (pure) materials — Mango wood and Desi Ghee — strictly following Puranic scriptures. No synthetic materials or shortcuts are permitted. Every step is video-recorded for transparency and delivered to you.",
  },
];

const RITUAL_STEPS = [
  { step: 1, name: "Sankalp", desc: "The pandit takes a sacred vow on your behalf, reciting your full name, gotra, and birth details to bind the ritual's spiritual intention.", duration: "10 min", icon: "🙏" },
  { step: 2, name: "Kalash Sthapana", desc: "A sacred copper vessel filled with holy water, mango leaves, and a coconut is ceremonially installed as a divine witness to the ritual.", duration: "15 min", icon: "🏺" },
  { step: 3, name: "Navagraha Puja", desc: "All nine planetary deities are invoked and worshipped with their specific flowers, grains, and mantras — setting the energetic foundation.", duration: "30 min", icon: "🪐" },
  { step: 4, name: "Nag Abhishek", desc: "Silver serpent idols are bathed with milk, honey, turmeric, and Panchamrit (five sacred offerings) while Sarpa mantras are continuously chanted.", duration: "30 min", icon: "🐍" },
  { step: 5, name: "Mantra Japa", desc: "Rahu Beej Mantra and Ketu Beej Mantra are chanted in multiples of 108 — up to 10,008 repetitions depending on your chosen package.", duration: "60–180 min", icon: "📿" },
  { step: 6, name: "Homa / Havan", desc: "A sacred fire ritual where 108 to 1,008 ahutis are offered with specific herbs, mango wood, and Desi Ghee for deep purification.", duration: "60 min", icon: "🔥" },
  { step: 7, name: "Poornahuti & Visarjan", desc: "The grand concluding offering that formally seals and completes the ritual. Prasadam is then packed and dispatched to your registered address.", duration: "15 min", icon: "🪔" },
];

const PACKAGES = [
  {
    id: "essential",
    name: "Shanti Puja",
    nameSub: "Essential",
    price: 5100,
    popular: false,
    color: "#1D4ED8",
    priests: 1,
    duration: "2–3 hrs",
    mantraJapa: "108 Repetitions",
    highlights: "Full 10-Step Vidhi",
    bestFor: "Mild to moderate cases",
    includes: [
      "Sankalp (1 person)",
      "Full 10-Step Ritual Vidhi",
      "108 Mantra Japa",
      "Nag Abhishek (milk & water)",
      "Puja completion certificate",
      "Prasadam by standard courier",
    ],
    excludes: ["Panchamrit Abhishek", "Havan / Homa", "Live streaming", "Naga Idol"],
  },
  {
    id: "recommended",
    name: "Maha Shanti",
    nameSub: "Recommended",
    price: 11000,
    popular: true,
    color: "#C05621",
    priests: 3,
    duration: "3–4 hrs",
    mantraJapa: "1,008 Repetitions",
    highlights: "Panchamrit Abhishek",
    bestFor: "Severe Dosha or active Dasha",
    includes: [
      "Sankalp (up to 3 persons)",
      "Full 10-Step Ritual Vidhi",
      "1,008 Mantra Japa",
      "Panchamrit Abhishek (5 sacred offerings)",
      "Navagraha Homa",
      "Live video streaming link",
      "Priority prasadam delivery",
      "Puja certificate + photo report",
    ],
    excludes: ["Silver/Copper Naga Idol", "Brahmin bhojan"],
  },
  {
    id: "supreme",
    name: "Ati Maha Sarpa Yagya",
    nameSub: "Supreme",
    price: 21000,
    popular: false,
    color: "#7C2D12",
    priests: 5,
    duration: "5–6 hrs",
    mantraJapa: "10,008 Repetitions",
    highlights: "Silver/Copper Naga Idol (gifted)",
    bestFor: "Multi-generational family issues",
    includes: [
      "Sankalp (entire family)",
      "Full 10-Step Ritual Vidhi",
      "10,008 Mantra Japa",
      "Panchamrit Abhishek",
      "Maha Yagya (1,008 ahutis)",
      "Silver/Copper Naga Idol gifted to you",
      "Brahmin bhojan (priest meal)",
      "Live video streaming + video link (lifetime access)",
      "Priority Express prasadam",
      "1:1 post-puja astrologer consultation",
      "Detailed report with 30+ photos",
    ],
    excludes: [],
  },
];

const TABLE_ROWS = [
  { feature: "Price", essential: "₹5,100", recommended: "₹11,000", supreme: "₹21,000", type: "text" as const },
  { feature: "Pandits", essential: "1 Specialist", recommended: "3 Specialists", supreme: "5 Specialists", type: "text" as const },
  { feature: "Mantra Japa", essential: "108 Repetitions", recommended: "1,008 Repetitions", supreme: "10,008 Repetitions", type: "text" as const },
  { feature: "Duration", essential: "2–3 hrs", recommended: "3–4 hrs", supreme: "5–6 hrs", type: "text" as const },
  { feature: "Highlights", essential: "Full 10-Step Vidhi", recommended: "Panchamrit Abhishek", supreme: "Silver/Copper Naga Idol", type: "text" as const },
  { feature: "Best For", essential: "Mild to moderate", recommended: "Severe Dosha / Dasha", supreme: "Multi-generational", type: "text" as const },
  { feature: "Havan / Homa", essential: false, recommended: true, supreme: "Maha Yagya", type: "check" as const },
  { feature: "Live Streaming", essential: "Add-on", recommended: true, supreme: true, type: "check" as const },
  { feature: "Prasadam", essential: "Standard", recommended: "Priority", supreme: "Priority Express", type: "text" as const },
  { feature: "Naga Idol Gift", essential: false, recommended: false, supreme: true, type: "check" as const },
];

const ADDONS = [
  { id: "stream", icon: Video, label: "Live Video Stream", desc: "Watch your puja live on a private link", price: 500, availableFor: ["essential"], includedIn: ["recommended", "supreme"] },
  { id: "prasadam", icon: Package, label: "Priority Prasadam", desc: "Express delivery within 3–5 days", price: 250, availableFor: ["essential", "recommended"], includedIn: ["supreme"] },
  { id: "videolink", icon: Video, label: "Puja Video Link", desc: "Private, secure link for lifetime access to your full ritual recording", price: 1000, availableFor: ["essential", "recommended"], includedIn: ["supreme"] },
  { id: "person", icon: UserPlus, label: "Additional Person Sankalp", desc: "Add a family member to the ritual", price: 1500, availableFor: ["essential"], includedIn: ["recommended", "supreme"] },
  { id: "consult", icon: MessageCircle, label: "Post-Puja Consultation", desc: "30-min 1:1 call with an astrologer", price: 800, availableFor: ["essential", "recommended"], includedIn: ["supreme"] },
];

const TIMELINE = [
  { step: 1, icon: "📅", title: "You Book", desc: "Select a package, share your details, and complete payment. A booking confirmation will be sent to your email.", eta: "Immediate", color: "#1D4ED8", bg: "#EFF6FF" },
  { step: 2, icon: "🙏", title: "iMeUsWe Accepts", desc: "Our team reviews your booking and confirms the details. You will receive an update on the scheduled date and any information needed ahead of the puja.", eta: "Within 24 hrs", color: "#E77237", bg: "#FFF0E9" },
  { step: 3, icon: "🔥", title: "Puja Day", desc: "Your private live-stream link is shared 12 hours before the puja. The ritual is conducted at our Puja center in Bengaluru.", eta: "On booked date", color: "#C05621", bg: "#FFF0E9" },
  { step: 4, icon: "📦", title: "Post Puja", desc: "Prasad and a puja completion certificate are prepared and dispatched to your address after the ritual is complete.", eta: "5–7 days after", color: "#15803D", bg: "#F0FDF4" },
];

const REVIEWS = [
  { name: "Priya Subramaniam", location: "Chennai", rating: 5, date: "March 2025", text: "I had been facing constant setbacks at work for 3 years. After the Maha Shanti Puja, the change has been remarkable. The live stream was clear and the pandit explained every step in detail. Highly recommend!", package: "Maha Shanti", avatar: "PS", color: "#E77237" },
  { name: "Ramesh Nair", location: "Bangalore", rating: 5, date: "February 2025", text: "Booked the Supreme package for my son who had Anant Kaal Sarpa Dosh. The entire process was transparent — received a detailed certificate, 30+ photos, and the post-puja astrologer session was very insightful.", package: "Ati Maha Sarpa Yagya", avatar: "RN", color: "#C05621" },
  { name: "Ananya Joshi", location: "Pune", rating: 4, date: "January 2025", text: "Easy booking, professional pandits, timely prasadam. The website is simple to use — even my 70-year-old father could navigate it. Just wish the Essential package also included live streaming by default.", package: "Shanti Puja", avatar: "AJ", color: "#1D4ED8" },
  { name: "Vikram Mehta", location: "Delhi", rating: 5, date: "December 2024", text: "Booked after years of struggling with Shani Sade Sati combined with KSD. The 5 pandits were clearly very experienced and the live stream quality was excellent. Prasad arrived beautifully packed within 6 days.", package: "Ati Maha Sarpa Yagya", avatar: "VM", color: "#15803D" },
  { name: "Sunita Agarwal", location: "Jaipur", rating: 5, date: "November 2024", text: "The Sankalp was done very meticulously — the pandit even asked for my exact birth time to fine-tune the muhurat. Family feels a positive shift in the home energy. Will book again for Navagraha Shanti.", package: "Maha Shanti", avatar: "SA", color: "#6B21A8" },
];

const FAQS = [
  { q: "How do I know if I have Kaal Sarpa Dosh?", a: "Check your birth chart (Kundali). If all seven planets — Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn — fall on one side of the Rahu-Ketu axis, you have this dosh. You can consult an astrologer or upload your Kundali in the booking form and our team will verify free of cost." },
  { q: "Is the puja performed at the actual temple?", a: "Yes. Our verified pandits perform the ritual physically at your chosen temple (Trimbakeshwar, Sri Kalahasti, etc.) on the booked date. You watch it live via the stream link we provide. We never perform rituals remotely without temple sanction." },
  { q: "Can I attend the puja in person?", a: "Absolutely. If you prefer to attend in person, mention it in the booking notes. We'll coordinate a time with the temple and send you the exact location details. No additional charge for in-person attendance." },
  { q: "How long does the effect of the puja last?", a: "This is a one-time remedy for the dosh present in your birth chart. For maximum benefit, it is recommended to repeat every 5–7 years or as advised by your astrologer, especially during Rahu or Ketu Mahadasha." },
  { q: "What details do I need to provide for the Sankalp?", a: "You'll need: Full name, date of birth, birth place, gotra (paternal lineage name), and your specific wish/sankalp statement. If you don't know your gotra, you can use 'Kashyap' — the universal gotra." },
  { q: "Can the puja be done for multiple family members?", a: "Yes. Maha Shanti covers up to 3 persons and Ati Maha Sarpa Yagya covers the entire family. For Shanti Puja, add the 'Additional Person Sankalp' add-on for ₹1,500 per person." },
  { q: "What if I am not satisfied with the puja?", a: "We offer a full refund if the ritual was not performed as described, or a complimentary re-booking within 30 days if you feel the process was incomplete. Our coordinator will review your concern within 24 hours." },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function PoojaDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Look up puja from shared catalogue; fall back to first entry
  const puja = ALL_POOJAS.find((p) => p.id === id) ?? ALL_POOJAS[0];

  const [activeImage, setActiveImage] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState("recommended");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "process" | "packages" | "reviews" | "faq">("overview");
  const [wishlist, setWishlist] = useState(false);
  const [videoModal, setVideoModal] = useState(false);

  // Section refs for scroll-based navigation
  const overviewRef  = useRef<HTMLDivElement>(null);
  const processRef   = useRef<HTMLDivElement>(null);
  const packagesRef  = useRef<HTMLDivElement>(null);
  const reviewsRef   = useRef<HTMLDivElement>(null);
  const faqRef       = useRef<HTMLDivElement>(null);

  // Scroll to section (offset for sticky nav ~136px)
  const scrollToTab = (tab: typeof activeTab, ref: React.RefObject<HTMLDivElement>) => {
    setActiveTab(tab);
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 136;
    window.scrollTo({ top, behavior: "smooth" });
  };

  // IntersectionObserver — highlight active tab while scrolling
  useEffect(() => {
    const sections: { ref: React.RefObject<HTMLDivElement>; tab: typeof activeTab }[] = [
      { ref: overviewRef,  tab: "overview"  },
      { ref: processRef,   tab: "process"   },
      { ref: packagesRef,  tab: "packages"  },
      { ref: reviewsRef,   tab: "reviews"   },
      { ref: faqRef,       tab: "faq"       },
    ];
    const observers = sections.map(({ ref, tab }) => {
      if (!ref.current) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveTab(tab); },
        { rootMargin: "-136px 0px -55% 0px", threshold: 0 },
      );
      obs.observe(ref.current);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  const pkg = PACKAGES.find((p) => p.id === selectedPackage)!;

  return (
    <div style={{ backgroundColor: "#F8F7FA", fontFamily: "'Public Sans', sans-serif" }}>
      <BookingProgress currentStep={2} />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
          <span className="cursor-pointer hover:text-orange-700" onClick={() => navigate("/")}>Home</span>
          <ChevronRight size={14} />
          <span className="cursor-pointer hover:text-orange-700" onClick={() => navigate("/")}>Pujas</span>
          <ChevronRight size={14} />
          <span style={{ color: "#E77237" }} className="font-medium">{puja.name}</span>
        </nav>
      </div>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden aspect-video shadow-lg bg-gray-900">
              <img src={GALLERY[activeImage].src} alt={GALLERY[activeImage].label} className="w-full h-full object-cover" />
              {GALLERY[activeImage].type === "video" && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button
                    onClick={() => setVideoModal(true)}
                    className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
                  >
                    <Play size={24} fill="#E77237" style={{ color: "#E77237" }} />
                  </button>
                  <span className="absolute bottom-4 left-4 text-xs text-white bg-black/60 px-2.5 py-1 rounded-full">▶ Watch ritual walkthrough</span>
                </div>
              )}
              {/* Top right actions */}
              <div className="absolute top-3 right-3 flex gap-2">
                <button onClick={() => setWishlist(!wishlist)} className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow">
                  <Heart size={16} fill={wishlist ? "#ef4444" : "none"} stroke={wishlist ? "#ef4444" : "#6b7280"} />
                </button>
                <button className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow">
                  <Share2 size={16} className="text-gray-500" />
                </button>
              </div>
              <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {activeImage + 1} / {GALLERY.length}
              </div>
            </div>
            {/* Thumbnails */}
            <div className="grid grid-cols-5 gap-2">
              {GALLERY.map((item, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveImage(i); if (item.type === "video") setVideoModal(true); }}
                  className={`relative rounded-lg overflow-hidden aspect-video border-2 transition-all ${activeImage === i ? "border-orange-500" : "border-transparent opacity-60 hover:opacity-90"}`}
                >
                  <img src={item.src} alt="" className="w-full h-full object-cover" />
                  {item.type === "video" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play size={12} fill="white" className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* What is this Puja */}
            <div
              className="rounded-2xl p-4 border"
              style={{ backgroundColor: "white", borderColor: "#FBCFB8" }}
            >
              <h3
                className="flex items-center gap-2 mb-3"
                style={{ fontFamily: "'Public Sans', sans-serif", color: "#1C1917", fontSize: "0.9rem", fontWeight: 700 }}
              >
                <span>🪔</span> What is this Puja?
              </h3>
              <div className="space-y-3">
                {puja.whatIsThis.map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0 leading-tight mt-0.5">{point.icon}</span>
                    <p className="text-xs text-gray-600 leading-relaxed">{point.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Info panel */}
          <div className="space-y-5">
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "#FFF0E9", color: "#7C3018" }}>🌟 Most Booked</span>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "#F0FDF4", color: "#15803D" }}>✅ Verified Ritual</span>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8" }}>🔴 Live Stream Available</span>
              </div>
              <h1 className="mb-1" style={{ fontFamily: "'Public Sans', sans-serif", color: "#1C1917", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, lineHeight: 1.3 }}>
                {puja.name}
              </h1>
              <p className="text-gray-500 text-sm">{puja.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(n => <Star key={n} size={15} fill={n <= Math.round(puja.rating) ? "#F59E0B" : "none"} stroke="#F59E0B" />)}
                </div>
                <span className="text-sm font-medium text-gray-700">{puja.rating}</span>
                <span className="text-sm text-gray-400">({puja.reviews} verified bookings)</span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Clock, label: "Duration", value: puja.duration, sub: "by package" },
                { icon: Users, label: "Priests", value: "1–5", sub: "certified" },
                { icon: Languages, label: "Language", value: "Sanskrit", sub: "+ vernacular" },
              ].map(({ icon: Icon, label, value, sub }) => (
                <div key={label} className="bg-white rounded-xl p-3 text-center border border-orange-100 shadow-sm">
                  <Icon size={18} className="mx-auto mb-1" style={{ color: "#E77237" }} />
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-semibold text-gray-800">{value}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              ))}
            </div>

            {/* Locations */}
            <div className="bg-white rounded-xl p-4 border border-orange-100 shadow-sm">
              <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1"><MapPin size={13} /> Locations</p>
              <div className="flex flex-wrap gap-2">
                {puja.location.map((loc) => {
                  const label = FILTER_CONFIG.location.options.find((o) => o.id === loc)?.label ?? loc;
                  return (
                    <span key={loc} className="text-xs px-2.5 py-1 rounded-full border" style={{ borderColor: "#FBCFB8", color: "#7C3018", backgroundColor: "#FFF0E9" }}>
                      🛕 {label}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Price panel */}
            <div className="rounded-2xl p-5 border-2" style={{ backgroundColor: "#FFF0E9", borderColor: "#F9A87A" }}>
              <div className="flex items-end justify-between mb-1">
                <div>
                  <p className="text-xs text-gray-500">Starting from</p>
                  <p className="text-3xl font-bold" style={{ color: "#E77237", fontFamily: "'Public Sans', sans-serif" }}>₹{puja.price.toLocaleString("en-IN")}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Supreme upto</p>
                  <p className="text-lg font-semibold text-gray-700">₹21,000</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-4">3 packages available · All samagri & prasadam included</p>
              <button
                onClick={() => scrollToTab("packages", packagesRef)}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:shadow-lg"
                style={{ backgroundColor: "#E77237" }}
              >
                Select Package & Book <ArrowRight size={16} />
              </button>
              <div className="flex items-center justify-center gap-4 mt-3">
                {[{ icon: Shield, text: "Secure Payment" }, { icon: Award, text: "Certified Pandits" }].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1 text-xs text-gray-500">
                    <Icon size={11} style={{ color: "#E77237" }} />{text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STICKY TAB NAVIGATION ──────────────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            {([
              { id: "overview",  label: "Overview",       icon: BookOpen,   ref: overviewRef  },
              { id: "process",   label: "Ritual Process", icon: Flame,      ref: processRef   },
              { id: "packages",  label: "Package",        icon: LayoutGrid, ref: packagesRef  },
              { id: "reviews",   label: "Reviews",        icon: Star,       ref: reviewsRef   },
              { id: "faq",       label: "FAQs",           icon: HelpCircle, ref: faqRef       },
            ] as const).map(({ id, label, icon: Icon, ref }) => (
              <button
                key={id}
                onClick={() => scrollToTab(id, ref as React.RefObject<HTMLDivElement>)}
                className="flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all"
                style={{ borderColor: activeTab === id ? "#E77237" : "transparent", color: activeTab === id ? "#E77237" : "#6B7280" }}
              >
                <Icon size={14} />{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20">

        {/* ════════════════════════════════════════════════════════════
            OVERVIEW
        ════════════════════════════════════════════════════════════ */}
        <div ref={overviewRef} className="space-y-14">

            {/* ── Purpose ─────────────────────────────────────── */}
            <section>
              <SectionHeader icon="🎯" title="Purpose of This Puja" subtitle="Three core spiritual intentions that this ritual is specifically designed to fulfil." />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
                {PURPOSE.map((p, i) => (
                  <div key={i} className="rounded-2xl p-5 border shadow-sm" style={{ backgroundColor: p.bg, borderColor: p.bg }}>
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="text-3xl">{p.icon}</span>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: p.color }}>
                        {i + 1}
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2 text-sm" style={{ color: p.color, fontFamily: "'Public Sans', sans-serif", fontSize: "1rem" }}>{p.title}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Benefits ─────────────────────────────────────── */}
            <section>
              <SectionHeader icon="✨" title="Key Benefits" subtitle="Documented improvements observed by devotees after this ritual, across the four most commonly affected life areas." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {BENEFITS.map((b, i) => (
                  <div key={i} className="flex items-start gap-4 rounded-2xl p-5 border shadow-sm" style={{ backgroundColor: b.bg, borderColor: b.bg }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: "white" }}>
                      {b.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-sm" style={{ color: b.color, fontFamily: "'Public Sans', sans-serif", fontSize: "0.95rem" }}>{b.title}</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── What Happens Next ──────────────────────────── */}
            <section>
              <SectionHeader icon="🗺️" title="What Happens Next?" subtitle="A simple four-step journey from the moment you book to the prasad arriving at your door." />
              <div className="mt-8 relative">
                {/* Connector line (desktop) */}
                <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5" style={{ backgroundColor: "#FBCFB8" }} />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {TIMELINE.map((t, i) => (
                    <div key={t.step} className="flex flex-col items-center text-center md:relative">
                      {/* Step icon */}
                      <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl border-4 mb-4 z-10 shadow-md" style={{ backgroundColor: t.bg, borderColor: t.color }}>
                        {t.icon}
                      </div>
                      {/* Step number */}
                      <div className="absolute top-0 right-1/4 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white hidden md:flex" style={{ backgroundColor: t.color }}>
                        {i + 1}
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1" style={{ fontFamily: "'Public Sans', sans-serif" }}>{t.title}</h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium mb-2" style={{ backgroundColor: t.bg, color: t.color }}>{t.eta}</span>
                      <p className="text-xs text-gray-600 leading-relaxed">{t.desc}</p>
                      {/* Mobile connector */}
                      {i < TIMELINE.length - 1 && (
                        <div className="md:hidden w-0.5 h-6 my-1" style={{ backgroundColor: "#FBCFB8" }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Virtual Attendance ─────────────────────────── */}
            <section>
              <SectionHeader icon="📱" title="Virtual Attendance — How It Works" subtitle="You can participate in your puja from anywhere in the world. Here's exactly what to expect." />
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Mock live stream interface */}
                <div className="rounded-2xl overflow-hidden border shadow-md" style={{ borderColor: "#374151", backgroundColor: "#111827" }}>
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 px-3 py-2" style={{ backgroundColor: "#1F2937" }}>
                    <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500" /><div className="w-3 h-3 rounded-full bg-yellow-400" /><div className="w-3 h-3 rounded-full bg-green-500" /></div>
                    <div className="flex-1 mx-2 h-6 rounded text-xs text-gray-400 flex items-center px-2" style={{ backgroundColor: "#374151" }}>🔒 imeuswe.in/live/session-8f3b</div>
                  </div>
                  {/* Video area */}
                  <div className="relative" style={{ aspectRatio: "16/9" }}>
                    <img src={GALLERY[0].src} alt="Live ritual" className="w-full h-full object-cover opacity-90" />
                    <div className="absolute inset-0 bg-black/30" />
                    {/* LIVE badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: "#EF4444" }}>
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />LIVE
                    </div>
                    {/* Time */}
                    <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">01:23:47</div>
                    {/* Pandit name */}
                    <div className="absolute bottom-12 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded">iMeUsWe Center-Bengaluru</div>
                    {/* Controls */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}>
                      <div className="flex gap-3">
                        {[{ icon: "🔇", label: "Mute" }, { icon: "📷", label: "Cam" }, { icon: "💬", label: "Chat" }].map(b => (
                          <button key={b.label} className="flex flex-col items-center text-white">
                            <span className="text-base">{b.icon}</span>
                            <span className="text-[9px] mt-0.5">{b.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Chat strip */}
                  <div className="px-3 py-2 space-y-1" style={{ backgroundColor: "#111827" }}>
                    {[{ user: "You", msg: "🙏 Jai Shiv Shankar", color: "#FDBA74" }, { user: "Pt. Sharma", msg: "Now beginning Nag Abhishek. Please fold hands.", color: "#86EFAC" }].map((c, i) => (
                      <p key={i} className="text-xs"><span className="font-semibold" style={{ color: c.color }}>{c.user}: </span><span className="text-gray-300">{c.msg}</span></p>
                    ))}
                  </div>
                </div>

                {/* Feature list */}
                <div className="space-y-4">
                  {[
                    { icon: Wifi, title: "Private Stream Link", desc: "A secure, personal live-stream link is sent to your email and WhatsApp 30 minutes before the puja begins.", color: "#1D4ED8" },
                    { icon: Monitor, title: "Works on Any Device", desc: "Access from your phone, tablet, or desktop — no app download required. Works on any browser.", color: "#15803D" },
                    { icon: Camera, title: "Camera on Demand", desc: "During the stream, you can type in the chat to request the pandit to focus the camera on any specific part of the ritual.", color: "#C05621" },
                    { icon: PhoneCall, title: "Pandit Addresses You", desc: "Your pandit will say your name and Sankalp aloud during the ritual — you will hear it in real time.", color: "#7C2D12" },
                    { icon: Video, title: "Lifetime Recording Access", desc: "Your stream is automatically saved as a private video link. You can replay, share with family, or revisit it anytime — no expiry, yours forever.", color: "#6B21A8" },
                  ].map(({ icon: Icon, title, desc, color }) => (
                    <div key={title} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#FFF7ED" }}>
                        <Icon size={16} style={{ color }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{title}</p>
                        <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 p-3 rounded-xl text-xs" style={{ backgroundColor: "#FFF7ED", border: "1px solid #FDBA74", color: "#92400E" }}>
                    💡 Live streaming is <strong>included free</strong> in Maha Shanti and Ati Maha Sarpa Yagya packages. Available as a paid add-on for Shanti Puja.
                  </div>
                </div>
              </div>
            </section>

        </div>

        {/* ════════════════════════════════════════════════════════════
            RITUAL PROCESS
        ════════════════════════════════════════════════════════════ */}
        <div ref={processRef} className="space-y-12">

            {/* 5W1H */}
            <section>
              <SectionHeader icon="🧠" title="About This Ritual" subtitle="Six essential questions answered precisely, so you know exactly what you are booking." />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                {FIVE_W_ONE_H.map((item) => <FiveWCard key={item.key} item={item} />)}
              </div>
            </section>

            {/* 10-step ritual */}
            <section>
              <SectionHeader icon="🔥" title="The 10-Step Ritual — Step by Step" subtitle="A transparent walkthrough of every stage, performed by certified pandits on your behalf." />
              <div className="relative mt-6">
                <div className="absolute left-8 top-8 bottom-8 w-0.5 hidden sm:block" style={{ backgroundColor: "#FED7AA" }} />
                <div className="space-y-5">
                  {RITUAL_STEPS.map((step) => {
                    const included = step.step <= 5 || (step.step === 6 && selectedPackage !== "essential") || step.step === 7;
                    return (
                      <div key={step.step} className="flex gap-5 items-start">
                        <div className="w-16 h-16 rounded-full flex-shrink-0 flex flex-col items-center justify-center text-white text-xl border-4 z-10 shadow"
                          style={{ backgroundColor: included ? "#C05621" : "#E5E7EB", borderColor: included ? "#FED7AA" : "#D1D5DB" }}>
                          <span>{step.icon}</span>
                        </div>
                        <div className="flex-1 rounded-2xl p-5 border shadow-sm"
                          style={{ backgroundColor: included ? "#FFF7ED" : "#F9FAFB", borderColor: included ? "#FED7AA" : "#E5E7EB" }}>
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="text-sm font-semibold text-gray-900">Step {step.step}: {step.name}</h3>
                                {step.step === 6 && selectedPackage === "essential" && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Maha Shanti & Supreme only</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                            </div>
                            <span className="text-xs px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 flex items-center gap-1" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>
                              <Clock size={10} />{step.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

        </div>

        {/* ════════════════════════════════════════════════════════════
            PACKAGE
        ════════════════════════════════════════════════════════════ */}
        <div ref={packagesRef}>
          <SectionHeader icon="📊" title="Package Comparison" subtitle="All three packages at a glance — choose the one that fits your needs and proceed to booking." />

          {/* Two-column layout on desktop: table+addons left, sticky summary right */}
          <div className="mt-6 flex flex-col lg:flex-row gap-6 items-start">

            {/* ── LEFT: Comparison Table + Add-ons ── */}
            <div className="flex-1 min-w-0 space-y-6">

              {/* Comparison Table */}
              <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: "#FED7AA" }}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 bg-white border-b" style={{ borderColor: "#FEF3C7", width: "28%" }}>Feature</th>
                        {PACKAGES.map((p) => (
                          <th key={p.id} className="px-4 py-3 text-center border-b relative" style={{ borderColor: "#FEF3C7", backgroundColor: p.popular ? "#FFF7ED" : "white", width: "24%" }}>
                            {p.popular && (
                              <div className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-0">
                                <span className="text-xs px-2.5 py-0.5 rounded-b-lg font-medium text-white whitespace-nowrap" style={{ backgroundColor: "#C05621" }}>⭐ Recommended</span>
                              </div>
                            )}
                            <p className="text-sm font-bold mt-3" style={{ color: p.color, fontFamily: "'Playfair Display', serif" }}>{p.name}</p>
                            <p className="text-xs text-gray-400">{p.nameSub}</p>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {TABLE_ROWS.map((row, i) => (
                        <tr key={row.feature} style={{ backgroundColor: i % 2 === 0 ? "white" : "#FFFBF5" }}>
                          <td className="px-4 py-2.5 text-xs font-medium text-gray-600 border-b" style={{ borderColor: "#FEF3C7" }}>{row.feature}</td>
                          {(["essential", "recommended", "supreme"] as const).map((col) => {
                            const pkgItem = PACKAGES.find(p => p.id === col)!;
                            const val = row[col];
                            return (
                              <td key={col} className="px-4 py-2.5 text-center text-xs border-b" style={{ borderColor: "#FEF3C7", backgroundColor: pkgItem.popular ? (i % 2 === 0 ? "#FFF7ED" : "#FEF3C7") : undefined }}>
                                {row.type === "check" ? (
                                  typeof val === "boolean" ? (
                                    val ? <Check size={13} className="mx-auto" style={{ color: "#15803D" }} /> : <Minus size={13} className="mx-auto text-gray-300" />
                                  ) : (
                                    <span className="text-xs text-gray-700">{val as string}</span>
                                  )
                                ) : (
                                  <span className={`text-xs ${col === "recommended" ? "font-semibold" : ""}`} style={{ color: col === "recommended" ? pkgItem.color : "#374151" }}>{val as string}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      {/* Select row */}
                      <tr style={{ backgroundColor: "#FFFBF5" }}>
                        <td className="px-4 py-3 text-xs font-medium text-gray-600"></td>
                        {PACKAGES.map((p) => (
                          <td key={p.id} className="px-4 py-3 text-center" style={{ backgroundColor: p.popular ? "#FFF7ED" : undefined }}>
                            <button
                              onClick={() => { setSelectedPackage(p.id); }}
                              className="w-full py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                              style={{ backgroundColor: selectedPackage === p.id ? p.color : "#E5E7EB", color: selectedPackage === p.id ? "white" : "#6B7280" }}
                            >
                              {selectedPackage === p.id ? "✓ Selected" : "Select"}
                            </button>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>


            </div>

            {/* ── RIGHT: Sticky Price Summary ── */}
            <div className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-36">
              <PriceSummary pkg={pkg} selectedAddons={[]} totalPrice={pkg.price} onBook={() => navigate(`/pooja/${puja.id}/book`, { state: { packageId: selectedPackage } })} />
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            REVIEWS
        ════════════════════════════════════════════════════════════ */}
        <div ref={reviewsRef} className="space-y-8">
            <SectionHeader icon="⭐" title="What Our Devotees Say" subtitle="Real experiences from verified bookings only. We do not edit or filter reviews." />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Rating box */}
              <div className="bg-white rounded-2xl p-6 border border-orange-100 shadow-sm text-center">
                <p className="text-6xl font-bold" style={{ color: "#C05621", fontFamily: "'Playfair Display', serif" }}>4.8</p>
                <div className="flex justify-center gap-0.5 my-2">
                  {[1,2,3,4,5].map(n => <Star key={n} size={18} fill={n <= 5 ? "#F59E0B" : "none"} stroke="#F59E0B" />)}
                </div>
                <p className="text-sm text-gray-500">Based on 312 bookings</p>
                <div className="mt-4 pt-4 border-t border-orange-100 space-y-1.5 text-left">
                  {[{ stars: 5, pct: 78 }, { stars: 4, pct: 14 }, { stars: 3, pct: 5 }, { stars: 2, pct: 2 }, { stars: 1, pct: 1 }].map(({ stars, pct }) => (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-5">{stars}★</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: stars >= 4 ? "#F59E0B" : stars === 3 ? "#FCA5A5" : "#EF4444" }} />
                      </div>
                      <span className="text-xs text-gray-400 w-8">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* 2 featured reviews */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {REVIEWS.slice(0, 4).map((r, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: r.color }}>{r.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{r.name}</p>
                        <p className="text-xs text-gray-400">{r.location} · {r.date}</p>
                      </div>
                      <div className="flex gap-0.5 flex-shrink-0">
                        {[1,2,3,4,5].map(n => <Star key={n} size={12} fill={n <= r.rating ? "#F59E0B" : "none"} stroke="#F59E0B" />)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">"{r.text}"</p>
                    <span className="text-xs px-2.5 py-1 rounded-full self-start" style={{ backgroundColor: "#FFF7ED", color: "#C05621" }}>{r.package}</span>
                  </div>
                ))}
              </div>
            </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            FAQs
        ════════════════════════════════════════════════════════════ */}
        <div ref={faqRef} className="space-y-8">
            <SectionHeader icon="💬" title="Frequently Asked Questions" subtitle="Everything you need to know before booking. Still unsure? Our puja coordinator responds within 15 minutes." />
            <div className="max-w-3xl mx-auto space-y-3">
              {FAQS.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl border shadow-sm overflow-hidden transition-all" style={{ borderColor: openFaq === i ? "#FDBA74" : "#F3F4F6" }}>
                  <button className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span className="text-sm font-medium text-gray-800 flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>{i + 1}</span>
                      {faq.q}
                    </span>
                    {openFaq === i ? <ChevronUp size={18} style={{ color: "#C05621" }} className="flex-shrink-0" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 pt-0">
                      <div className="h-px mb-4" style={{ backgroundColor: "#FED7AA" }} />
                      <p className="text-sm text-gray-600 leading-relaxed pl-8">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="max-w-3xl mx-auto rounded-2xl p-6 text-center" style={{ backgroundColor: "#FFF7ED", border: "1px solid #FDBA74" }}>
              <p className="text-sm font-medium text-gray-700 mb-3">Still have a question about this puja?</p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button className="px-5 py-2.5 rounded-full text-sm font-medium text-white flex items-center gap-2" style={{ backgroundColor: "#25D366" }}>
                  <MessageCircle size={15} /> Chat on WhatsApp
                </button>
                <button className="px-5 py-2.5 rounded-full text-sm font-medium border flex items-center gap-2" style={{ borderColor: "#C05621", color: "#C05621" }}>
                  <PhoneCall size={15} /> Call Us
                </button>
              </div>
            </div>
        </div>

      </div>

      {/* ── MOBILE STICKY FOOTER ─────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t shadow-lg px-4 py-3" style={{ backgroundColor: "white", borderColor: "#FED7AA" }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">Total ({pkg.nameSub})</p>
            <p className="text-lg font-bold" style={{ color: "#C05621", fontFamily: "'Playfair Display', serif" }}>₹{pkg.price.toLocaleString("en-IN")}</p>
          </div>
          <button onClick={() => navigate("/pooja/kaal-sarpa-dosh/book", { state: { packageId: selectedPackage } })} className="flex-1 max-w-xs py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2" style={{ backgroundColor: "#C05621" }}>
            Proceed to Book <ArrowRight size={15} />
          </button>
        </div>
      </div>
      <div className="h-20 md:hidden" />

      {/* ── VIDEO MODAL ──────────────────────────────────────────── */}
      {videoModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80" onClick={() => setVideoModal(false)}>
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Play size={16} style={{ color: "#C05621" }} /> Ritual Walkthrough Preview</h3>
              <button onClick={() => setVideoModal(false)}><X size={20} className="text-gray-500" /></button>
            </div>
            <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
              <img src={GALLERY[0].src} alt="Video preview" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center"><Play size={24} fill="white" className="text-white" /></div>
                <p className="text-white text-sm font-medium">Full Kaal Sarpa Dosh Ritual — 3 min overview</p>
                <p className="text-white/60 text-xs">Actual temple footage from Trimbakeshwar, 2024</p>
              </div>
            </div>
            <div className="p-4 text-center">
              <button onClick={() => navigate("/pooja/kaal-sarpa-dosh/book")} className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm" style={{ backgroundColor: "#C05621" }}>
                Book This Pooja <ArrowRight size={14} className="inline ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="mb-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{icon}</span>
        <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: "#1C1917" }}>{title}</h2>
      </div>
      <p className="text-sm text-gray-500 ml-8">{subtitle}</p>
      <div className="h-0.5 rounded-full mt-3 w-16 ml-8" style={{ backgroundColor: "#C05621" }} />
    </div>
  );
}

function FiveWCard({ item }: { item: typeof FIVE_W_ONE_H[0] }) {
  const [expanded, setExpanded] = useState(false);
  const short = item.answer.slice(0, 130) + "…";
  return (
    <div className="rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all" style={{ backgroundColor: item.bg, borderColor: item.bg }}>
      <div className="flex items-center gap-2.5 mb-3">
        <span className="text-2xl">{item.icon}</span>
        <h3 className="text-sm font-semibold" style={{ color: item.color, fontFamily: "'Playfair Display', serif" }}>{item.question}</h3>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{expanded ? item.answer : short}</p>
      <button className="text-xs font-medium mt-2 flex items-center gap-1 transition-all" style={{ color: item.color }} onClick={() => setExpanded(!expanded)}>
        {expanded ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Read more</>}
      </button>
    </div>
  );
}

function PackageCard({ pkg, selected, onSelect }: { pkg: typeof PACKAGES[0]; selected: boolean; onSelect: () => void }) {
  return (
    <div onClick={onSelect} className="relative rounded-2xl p-5 border-2 cursor-pointer transition-all hover:shadow-lg"
      style={{ borderColor: selected ? pkg.color : "#E5E7EB", backgroundColor: selected ? "#FFFBF5" : "white", boxShadow: selected ? `0 0 0 2px ${pkg.color}20` : undefined }}>
      {pkg.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap" style={{ backgroundColor: pkg.color }}>⭐ Recommended</div>
      )}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>{pkg.name}</h3>
          <p className="text-xs text-gray-500">{pkg.nameSub}</p>
        </div>
        <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center" style={{ borderColor: selected ? pkg.color : "#D1D5DB", backgroundColor: selected ? pkg.color : "transparent" }}>
          {selected && <Check size={11} className="text-white" />}
        </div>
      </div>
      <div className="mb-3">
        <p className="text-2xl font-bold" style={{ color: pkg.color, fontFamily: "'Playfair Display', serif" }}>₹{pkg.price.toLocaleString("en-IN")}</p>
        <p className="text-xs text-gray-400">per booking · all samagri included</p>
      </div>
      <div className="flex gap-3 mb-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><Users size={11} /> {pkg.priests} priest{pkg.priests > 1 ? "s" : ""}</span>
        <span className="flex items-center gap-1"><Clock size={11} /> {pkg.duration}</span>
      </div>
      <div className="space-y-1.5">
        {pkg.includes.map((item) => (
          <div key={item} className="flex items-start gap-2 text-xs text-gray-700"><Check size={12} className="flex-shrink-0 mt-0.5" style={{ color: "#15803D" }} />{item}</div>
        ))}
        {pkg.excludes.map((item) => (
          <div key={item} className="flex items-start gap-2 text-xs text-gray-400"><Minus size={12} className="flex-shrink-0 mt-0.5 text-gray-300" />{item}</div>
        ))}
      </div>
    </div>
  );
}

function AddonCard({ addon, selected, onToggle }: { addon: typeof ADDONS[0]; selected: boolean; onToggle: () => void }) {
  const Icon = addon.icon;
  return (
    <div onClick={onToggle} className="flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-sm"
      style={{ borderColor: selected ? "#C05621" : "#E5E7EB", backgroundColor: selected ? "#FFF7ED" : "white" }}>
      <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: selected ? "#FDBA74" : "#F3F4F6" }}>
        <Icon size={16} style={{ color: selected ? "#7C2D12" : "#6B7280" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{addon.label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{addon.desc}</p>
        <p className="text-sm font-semibold mt-1" style={{ color: "#C05621" }}>+ ₹{addon.price.toLocaleString("en-IN")}</p>
      </div>
      <div className="w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center mt-0.5"
        style={{ borderColor: selected ? "#C05621" : "#D1D5DB", backgroundColor: selected ? "#C05621" : "transparent" }}>
        {selected && <Check size={11} className="text-white" />}
      </div>
    </div>
  );
}

function PriceSummary({ pkg, selectedAddons, totalPrice, onBook }: { pkg: typeof PACKAGES[0]; selectedAddons: string[]; totalPrice: number; onBook: () => void }) {
  const addonsData = selectedAddons.map((id) => ADDONS.find((a) => a.id === id)!).filter(Boolean);
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "#FDBA74" }}>
      <div className="px-6 py-4 border-b" style={{ backgroundColor: "#FFF7ED", borderColor: "#FED7AA" }}>
        <h3 className="font-semibold text-gray-800">Booking Summary</h3>
      </div>
      <div className="p-6 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 flex items-center gap-2"><Check size={14} style={{ color: "#15803D" }} />{pkg.name} ({pkg.nameSub})</span>
          <span className="font-medium text-gray-800">₹{pkg.price.toLocaleString("en-IN")}</span>
        </div>
        {addonsData.map((a) => (
          <div key={a.id} className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-2"><Plus size={14} style={{ color: "#C05621" }} />{a.label}</span>
            <span className="font-medium text-gray-800">₹{a.price.toLocaleString("en-IN")}</span>
          </div>
        ))}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 flex items-center gap-2"><Info size={13} style={{ color: "#6B7280" }} />All samagri & prasadam delivery</span>
          <span className="text-green-600 font-medium">Included</span>
        </div>
        <div className="h-px" style={{ backgroundColor: "#FED7AA" }} />
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-800">Total</span>
          <span className="text-xl font-bold" style={{ color: "#C05621", fontFamily: "'Playfair Display', serif" }}>₹{totalPrice.toLocaleString("en-IN")}</span>
        </div>
        <button onClick={onBook} className="w-full py-4 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 transition-all hover:shadow-lg mt-2" style={{ backgroundColor: "#C05621" }}>
          Proceed to Book <ArrowRight size={16} />
        </button>
        <div className="flex items-center justify-center gap-6 pt-1">
          {[{ icon: Shield, text: "100% Secure" }, { icon: Award, text: "Certified Pandits" }, { icon: Truck, text: "Prasadam Delivered" }].map(({ icon: Icon, text }) => (
            <div key={text} className="flex flex-col items-center gap-1 text-xs text-gray-400"><Icon size={14} style={{ color: "#C05621" }} />{text}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
