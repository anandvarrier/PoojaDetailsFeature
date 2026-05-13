import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Search, Star, Clock, MapPin, ChevronRight, Zap, X,
  SlidersHorizontal, Phone, MessageCircle, ChevronDown,
  ChevronUp, Filter, Check,
} from "lucide-react";
import { ALL_POOJAS, FILTER_CONFIG, SEARCH_SUGGESTIONS, type Puja, type FilterKey } from "../data/pujaData";
import { Footer } from "../components/Footer";

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function AllPujasPage() {
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [instantOnly, setInstantOnly] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState<string | null>("category");

  const filteredPoojas = ALL_POOJAS.filter((p) => {
    if (instantOnly && !p.isInstant) return false;
    if (activeFilters.category?.length && !activeFilters.category.some((f) => p.category.includes(f))) return false;
    if (activeFilters.deity?.length && !activeFilters.deity.some((f) => p.deity.includes(f))) return false;
    if (activeFilters.benefits?.length && !activeFilters.benefits.some((f) => p.benefits.includes(f))) return false;
    if (activeFilters.location?.length && !activeFilters.location.some((f) => p.location.includes(f))) return false;
    if (activeFilters.festival?.length && !activeFilters.festival.some((f) => p.festival.includes(f))) return false;
    if (activeFilters.language?.length && !activeFilters.language.some((f) => p.language.includes(f))) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.deity.some((d) => d.includes(q)) ||
        p.category.some((c) => c.includes(q)) ||
        p.location.some((l) => l.includes(q)) ||
        p.benefits.some((b) => b.includes(q)) ||
        p.festival.some((f) => f.includes(q))
      );
    }
    return true;
  });

  const totalActiveFilters =
    (instantOnly ? 1 : 0) +
    Object.values(activeFilters).reduce((s, arr) => s + arr.length, 0);

  const toggleFilter = (group: string, id: string) => {
    setActiveFilters((prev) => {
      const current = prev[group] ?? [];
      return {
        ...prev,
        [group]: current.includes(id) ? current.filter((f) => f !== id) : [...current, id],
      };
    });
  };

  const clearGroup = (group: string) => {
    setActiveFilters((prev) => ({ ...prev, [group]: [] }));
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setInstantOnly(false);
    setQuery("");
  };

  return (
    <div style={{ backgroundColor: "#F8F7FA", fontFamily: "'Public Sans', sans-serif", minHeight: "100vh" }}>

      {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
      <div
        className="py-10 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: "#FFF0E9", borderBottom: "1px solid #FBCFB8" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🙏</span>
            <h1
              style={{
                fontFamily: "'Public Sans', sans-serif",
                color: "#1C1917",
                fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)",
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              All Pujas & Rituals
            </h1>
          </div>
          <p className="text-sm mt-1 ml-9" style={{ color: "#6B7280" }}>
            Browse {ALL_POOJAS.length}+ pujas · Filter by deity, benefit, location & more · Book in minutes
          </p>

          {/* Quick stat pills */}
          <div className="flex flex-wrap gap-2 mt-4 ml-9">
            {[
              { label: `${ALL_POOJAS.length} Pujas`, icon: "✨" },
              { label: `${ALL_POOJAS.filter(p => p.isInstant).length} Instant`, icon: "⚡" },
              { label: "10 Locations", icon: "📍" },
              { label: "Verified Pandits", icon: "✅" },
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
        </div>
      </div>

      {/* ── FILTER + SEARCH + CATALOGUE ──────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Mobile filter button */}
        <div className="flex items-center justify-between mb-5 lg:hidden">
          <p className="text-sm text-gray-500">
            <span className="font-medium text-gray-800">{filteredPoojas.length}</span> pujas found
          </p>
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-full border font-medium relative"
            style={{
              borderColor: "#E77237",
              color: "#E77237",
              backgroundColor: totalActiveFilters > 0 ? "#FFF0E9" : "white",
            }}
          >
            <Filter size={14} />
            Filters
            {totalActiveFilters > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs text-white flex items-center justify-center font-bold"
                style={{ backgroundColor: "#E77237" }}
              >
                {totalActiveFilters}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-6">

          {/* ── SIDEBAR FILTERS (desktop) ─── */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div
              className="rounded-2xl border p-4 sticky top-20"
              style={{ backgroundColor: "white", borderColor: "#FBCFB8" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <SlidersHorizontal size={15} style={{ color: "#E77237" }} />
                  Filter Pujas
                </h3>
                {totalActiveFilters > 0 && (
                  <button onClick={clearAllFilters} className="text-xs flex items-center gap-1" style={{ color: "#E77237" }}>
                    Clear all ({totalActiveFilters})
                  </button>
                )}
              </div>

              {/* Instant toggle */}
              <div
                className="flex items-center justify-between p-3 rounded-xl mb-3 cursor-pointer transition-all"
                style={{
                  backgroundColor: instantOnly ? "#F0FDF4" : "#F9FAFB",
                  border: `1.5px solid ${instantOnly ? "#86EFAC" : "#E5E7EB"}`,
                }}
                onClick={() => setInstantOnly(!instantOnly)}
              >
                <div className="flex items-center gap-2">
                  <Zap size={14} style={{ color: instantOnly ? "#059669" : "#9CA3AF" }} />
                  <span className="text-sm font-medium text-gray-700">Instant Pujas</span>
                </div>
                <div
                  className="rounded-full transition-all flex items-center px-0.5"
                  style={{ width: "36px", height: "20px", backgroundColor: instantOnly ? "#059669" : "#D1D5DB" }}
                >
                  <div
                    className="rounded-full bg-white shadow-sm transition-all"
                    style={{ width: "16px", height: "16px", transform: instantOnly ? "translateX(16px)" : "translateX(0)" }}
                  />
                </div>
              </div>

              {Object.entries(FILTER_CONFIG).map(([key, config]) => (
                <FilterGroup
                  key={key}
                  config={config}
                  activeValues={activeFilters[key as FilterKey] ?? []}
                  expanded={expandedFilter === key}
                  onToggleExpand={() => setExpandedFilter(expandedFilter === key ? null : key)}
                  onToggleOption={(id) => toggleFilter(key, id)}
                  onSelectAll={() => clearGroup(key)}
                />
              ))}
            </div>
          </aside>

          {/* ── RIGHT COLUMN ── */}
          <div className="flex-1 min-w-0">

            {/* Search box */}
            <div ref={searchRef} className="relative mb-4">
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all bg-white"
                style={{ borderColor: focused ? "#E77237" : "#FBCFB8" }}
              >
                <Search size={18} style={{ color: focused ? "#E77237" : "#9CA3AF" }} className="flex-shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 150)}
                  placeholder="Search by puja name, deity, benefit, location, festival..."
                  className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                />
                {query && (
                  <button onClick={() => setQuery("")}>
                    <X size={16} className="text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              {/* Suggestions dropdown */}
              {focused && !query && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border shadow-xl z-30 p-4"
                  style={{ borderColor: "#FBCFB8" }}
                >
                  <p className="text-xs text-gray-400 mb-2.5">Popular searches</p>
                  <div className="flex flex-wrap gap-2">
                    {SEARCH_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="text-xs px-3 py-1.5 rounded-full border transition-all hover:border-orange-400 hover:text-orange-700"
                        style={{ borderColor: "#FBCFB8", color: "#7C3018", backgroundColor: "#FFF0E9" }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Active filter chips */}
            {totalActiveFilters > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {instantOnly && (
                  <ActiveChip label="⚡ Instant Pujas" onRemove={() => setInstantOnly(false)} />
                )}
                {Object.entries(activeFilters).flatMap(([group, ids]) =>
                  ids.map((id) => {
                    const config = FILTER_CONFIG[group as FilterKey];
                    const option = config?.options.find((o) => o.id === id);
                    return option ? (
                      <ActiveChip
                        key={`${group}-${id}`}
                        label={option.label}
                        onRemove={() => toggleFilter(group, id)}
                      />
                    ) : null;
                  })
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-xs px-3 py-1.5 rounded-full border font-medium transition-colors"
                  style={{ borderColor: "#EF4444", color: "#EF4444" }}
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Results meta */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-800">{filteredPoojas.length}</span>
                {filteredPoojas.length === 1 ? " ritual" : " rituals"} found
              </p>
              <select
                className="text-sm border rounded-lg px-3 py-1.5 outline-none bg-white"
                style={{ borderColor: "#FBCFB8", color: "#374151" }}
              >
                <option>Most Popular</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Highest Rated</option>
              </select>
            </div>

            {/* Grid */}
            {filteredPoojas.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredPoojas.map((p) => (
                  <PujaCard key={p.id} puja={p} onClick={() => navigate(`/pooja/${p.id}`)} />
                ))}
              </div>
            ) : (
              <NoResultsState query={query} onClear={clearAllFilters} />
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE FILTER DRAWER ── */}
      {showMobileFilters && (
        <MobileFilterDrawer
          activeFilters={activeFilters}
          instantOnly={instantOnly}
          onToggleInstant={() => setInstantOnly(!instantOnly)}
          onToggleOption={toggleFilter}
          onClearGroup={clearGroup}
          onClear={clearAllFilters}
          onClose={() => setShowMobileFilters(false)}
          totalCount={filteredPoojas.length}
        />
      )}

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function PujaCard({ puja, onClick }: { puja: Puja; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden border cursor-pointer transition-all hover:shadow-lg group flex flex-col"
      style={{ borderColor: "#FEE2E2" }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9", flexShrink: 0 }}>
        <img
          src={puja.image}
          alt={puja.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span
          className="absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-medium text-white"
          style={{ backgroundColor: puja.tagColor }}
        >
          {puja.tag}
        </span>
      </div>

      {/* Body — flex column so CTA stays pinned to bottom */}
      <div className="p-4 flex flex-col flex-1">
        {/* Name */}
        <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-1.5">{puja.name}</h3>

        {/* Description — fixed to exactly 2 lines via min-height */}
        <p
          className="text-xs text-gray-500 leading-relaxed line-clamp-2"
          style={{ minHeight: "2.5rem" }}
        >
          {puja.description}
        </p>

        {/* Push everything below to the bottom */}
        <div className="mt-auto pt-3 space-y-2">
          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={11} style={{ color: "#E77237" }} />
            {puja.location
              .slice(0, 2)
              .map((l) => FILTER_CONFIG.location.options.find((o) => o.id === l)?.label ?? l)
              .join(" · ")}
            {puja.location.length > 2 && (
              <span className="text-gray-400">+{puja.location.length - 2}</span>
            )}
          </div>

          {/* Rating + Duration */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Star size={11} fill="#F59E0B" stroke="#F59E0B" />
              {puja.rating} ({puja.reviews})
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} /> {puja.duration}
            </span>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-xs text-gray-400">Starting from</p>
              <p className="font-bold" style={{ color: "#E77237", fontFamily: "'Public Sans', sans-serif" }}>
                ₹{puja.price.toLocaleString("en-IN")}
              </p>
            </div>
            <button
              className="text-xs px-3 py-1.5 rounded-full text-white flex items-center gap-1 font-medium"
              style={{ backgroundColor: "#E77237" }}
            >
              View <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  config,
  activeValues,
  expanded,
  onToggleExpand,
  onToggleOption,
  onSelectAll,
}: {
  config: { label: string; icon: string; options: readonly { id: string; label: string; icon?: string }[] };
  activeValues: string[];
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleOption: (id: string) => void;
  onSelectAll: () => void;
}) {
  const allSelected = activeValues.length === 0;

  return (
    <div className="border-t pt-3 mt-3" style={{ borderColor: "#FFF0E9" }}>
      <button
        className="w-full flex items-center justify-between text-sm font-medium text-gray-700 mb-2"
        onClick={onToggleExpand}
      >
        <span className="flex items-center gap-1.5">
          <span>{config.icon}</span>
          {config.label}
          {!allSelected && (
            <span
              className="w-5 h-5 rounded-full text-xs text-white flex items-center justify-center font-bold"
              style={{ backgroundColor: "#E77237" }}
            >
              {activeValues.length}
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {/* "All" option */}
          <label
            className="flex items-center gap-2.5 cursor-pointer py-1 px-2 rounded-lg transition-all"
            style={{ backgroundColor: allSelected ? "#FFF0E9" : "transparent" }}
            onClick={onSelectAll}
          >
            <div
              className="rounded flex-shrink-0 flex items-center justify-center transition-all"
              style={{
                width: "16px", height: "16px",
                border: `2px solid ${allSelected ? "#E77237" : "#D1D5DB"}`,
                backgroundColor: allSelected ? "#E77237" : "transparent",
              }}
            >
              {allSelected && <Check size={9} className="text-white" />}
            </div>
            <span className="text-xs text-gray-700 font-medium select-none">All</span>
          </label>

          {/* Individual options */}
          {config.options.map((opt) => {
            const isActive = activeValues.includes(opt.id);
            return (
              <label
                key={opt.id}
                className="flex items-center gap-2.5 cursor-pointer py-1 px-2 rounded-lg transition-all"
                style={{ backgroundColor: isActive ? "#FFF0E9" : "transparent" }}
                onClick={() => onToggleOption(opt.id)}
              >
                <div
                  className="rounded flex-shrink-0 flex items-center justify-center transition-all"
                  style={{
                    width: "16px", height: "16px",
                    border: `2px solid ${isActive ? "#E77237" : "#D1D5DB"}`,
                    backgroundColor: isActive ? "#E77237" : "transparent",
                  }}
                >
                  {isActive && <Check size={9} className="text-white" />}
                </div>
                <span className="text-xs text-gray-700 flex items-center gap-1 select-none">
                  {"icon" in opt && <span>{opt.icon}</span>}
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
      style={{ backgroundColor: "#FFF0E9", color: "#7C3018", border: "1px solid #FBCFB8" }}
    >
      {label}
      <button onClick={onRemove} className="hover:opacity-70 transition-opacity">
        <X size={11} />
      </button>
    </div>
  );
}

function NoResultsState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="text-center py-14 px-4">
      <div className="text-5xl mb-4">🙏</div>
      <h3
        className="mb-2"
        style={{ fontFamily: "'Public Sans', sans-serif", color: "#1C1917", fontSize: "1.2rem", fontWeight: 700 }}
      >
        We're on it for you
      </h3>
      <p className="text-sm text-gray-500 mb-2 max-w-sm mx-auto leading-relaxed">
        {query
          ? `We couldn't find an exact match for "${query}", but our pandits may be able to arrange a custom puja for you.`
          : "We couldn't find pujas matching those filters. Try adjusting them or speak to our team."}
      </p>
      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
        Many rare and region-specific rituals aren't listed publicly — our coordinators can help you find the right one.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
        <a
          href="https://wa.me/919876543210"
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white w-full sm:w-auto justify-center"
          style={{ backgroundColor: "#25D366" }}
        >
          <MessageCircle size={16} />
          Chat with Us on WhatsApp
        </a>
        <a
          href="tel:+919876543210"
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold w-full sm:w-auto justify-center border"
          style={{ borderColor: "#E77237", color: "#E77237", backgroundColor: "#FFF0E9" }}
        >
          <Phone size={16} />
          Call Us: +91 98765 43210
        </a>
      </div>
      <button onClick={onClear} className="text-sm underline underline-offset-2" style={{ color: "#E77237" }}>
        Clear filters and show all pujas
      </button>
    </div>
  );
}

function MobileFilterDrawer({
  activeFilters, instantOnly, onToggleInstant, onToggleOption, onClearGroup,
  onClear, onClose, totalCount,
}: {
  activeFilters: Record<string, string[]>;
  instantOnly: boolean;
  onToggleInstant: () => void;
  onToggleOption: (g: string, id: string) => void;
  onClearGroup: (g: string) => void;
  onClear: () => void;
  onClose: () => void;
  totalCount: number;
}) {
  const [expanded, setExpanded] = useState<string | null>("category");
  const totalActive = (instantOnly ? 1 : 0) + Object.values(activeFilters).reduce((s, a) => s + a.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl flex flex-col" style={{ maxHeight: "88vh" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <SlidersHorizontal size={16} style={{ color: "#E77237" }} />
            Filter Pujas
            {totalActive > 0 && <span className="text-xs text-orange-600">({totalActive} active)</span>}
          </h3>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Instant toggle */}
          <div
            className="flex items-center justify-between p-3 rounded-xl cursor-pointer mb-4"
            style={{
              backgroundColor: instantOnly ? "#F0FDF4" : "#F9FAFB",
              border: `1.5px solid ${instantOnly ? "#86EFAC" : "#E5E7EB"}`,
            }}
            onClick={onToggleInstant}
          >
            <div className="flex items-center gap-2">
              <Zap size={15} style={{ color: instantOnly ? "#059669" : "#9CA3AF" }} />
              <span className="text-sm font-medium text-gray-700">Instant Pujas Only</span>
            </div>
            <div
              className="rounded-full transition-all flex items-center px-0.5"
              style={{ width: "40px", height: "22px", backgroundColor: instantOnly ? "#059669" : "#D1D5DB" }}
            >
              <div
                className="rounded-full bg-white shadow-sm transition-all"
                style={{ width: "16px", height: "16px", transform: instantOnly ? "translateX(18px)" : "translateX(0)" }}
              />
            </div>
          </div>

          {Object.entries(FILTER_CONFIG).map(([key, config]) => (
            <FilterGroup
              key={key}
              config={config}
              activeValues={activeFilters[key] ?? []}
              expanded={expanded === key}
              onToggleExpand={() => setExpanded(expanded === key ? null : key)}
              onToggleOption={(id) => onToggleOption(key, id)}
              onSelectAll={() => onClearGroup(key)}
            />
          ))}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={() => { onClear(); onClose(); }}
            className="flex-1 py-3 rounded-xl text-sm font-medium border"
            style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "#E77237" }}
          >
            Show {totalCount} Result{totalCount !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}