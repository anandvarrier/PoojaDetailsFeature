export type OrderStatus =
  | "booked"        // Stage 1 – Payment done, pending iMeUsWe acceptance
  | "pending"       // Legacy alias for "booked"
  | "confirmed"     // Stage 2 – iMeUsWe accepted
  | "video_updated" // Stage 3 – Zoom/Meet link shared
  | "live"          // Stage 4 – Puja in progress
  | "completed"     // Stage 5 – Puja finished
  | "cancelled";    // Cancelled by user

export interface OrderMember {
  name: string;
  dob?: string;        // e.g. "1990-06-15"
  gotra?: string;
  nakshatra?: string;
  rashi?: string;
}

export interface StoredOrder {
  orderId: string;
  pujaName: string;
  pujaId?: string;
  packageName: string;
  packagePrice: number;
  addons: string[];
  addonTotal: number;
  couponDiscount: number;
  gst: number;
  total: number;
  date: string;        // Display string e.g. "Mon, 11 May"
  dateISO?: string;    // ISO date e.g. "2026-05-11"
  time: string;        // e.g. "06:00 AM"
  devotee: string;
  email: string;
  paymentMethod: string;
  transactionId: string;
  bookingTimestamp: string; // ISO string
  status: OrderStatus;
  videoLink?: string;  // Zoom or Google Meet URL
  members?: OrderMember[];
  rescheduleCount?: number;
}

const KEY = "imeuswe_orders";

export function saveOrder(order: StoredOrder): void {
  const existing = getOrders();
  const updated = [order, ...existing];
  try { localStorage.setItem(KEY, JSON.stringify(updated)); } catch { /* noop */ }
}

export function getOrders(): StoredOrder[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredOrder[];
  } catch {
    return [];
  }
}

export function updateOrder(orderId: string, updates: Partial<StoredOrder>): void {
  const orders = getOrders();
  const updated = orders.map((o) => o.orderId === orderId ? { ...o, ...updates } : o);
  try { localStorage.setItem(KEY, JSON.stringify(updated)); } catch { /* noop */ }
}

export function cancelOrder(orderId: string): void {
  updateOrder(orderId, { status: "cancelled" });
}

export function deleteOrder(orderId: string): void {
  const orders = getOrders().filter((o) => o.orderId !== orderId);
  try { localStorage.setItem(KEY, JSON.stringify(orders)); } catch { /* noop */ }
}

// ─── DEMO SEEDER ──────────────────────────────────────────────────────────────
// Seeds 5 sample orders covering all 5 statuses — useful for UI testing
export function seedDemoOrders(): void {
  const base = {
    packagePrice: 5100, addons: ["Prasad Delivery", "Live Stream"],
    addonTotal: 600, couponDiscount: 0, gst: 459,
    devotee: "Ramesh Subramaniam", email: "ramesh@example.com",
    paymentMethod: "upi", rescheduleCount: 0,
  };

  const demos: StoredOrder[] = [
    {
      ...base,
      orderId: "DEMO-BKDJ8A", pujaName: "Kaal Sarpa Dosh Puja", pujaId: "kaal-sarpa-dosh",
      packageName: "Standard – Single Devotee",
      total: 6159, date: "Mon, 11 May", dateISO: "2026-05-11", time: "06:00 AM",
      transactionId: "TXN82841001", bookingTimestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      status: "booked",
      members: [{ name: "Ramesh Subramaniam", dob: "1985-06-15", gotra: "Kashyapa", nakshatra: "Rohini", rashi: "Vrishabha" }],
    },
    {
      ...base,
      orderId: "DEMO-CNFM2B", pujaName: "Mangal Dosh Puja", pujaId: "mangal-dosh",
      packageName: "Premium – Family (up to 4)",
      packagePrice: 7100, total: 8359, date: "Mon, 18 May", dateISO: "2026-05-18", time: "09:00 AM",
      transactionId: "TXN82841002", bookingTimestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
      status: "confirmed",
      members: [
        { name: "Ramesh Subramaniam", dob: "1985-06-15", gotra: "Kashyapa", nakshatra: "Rohini" },
        { name: "Sunita Subramaniam", dob: "1988-03-22", gotra: "Kashyapa", nakshatra: "Punarvasu" },
      ],
    },
    {
      ...base,
      orderId: "DEMO-VDLK3C", pujaName: "Satyanarayan Puja", pujaId: "satyanarayan",
      packageName: "Standard – Single Devotee",
      total: 6159, date: "Wed, 7 May", dateISO: "2026-05-07", time: "11:00 AM",
      transactionId: "TXN82841003", bookingTimestamp: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
      status: "video_updated",
      videoLink: "https://zoom.us/j/12345678901?pwd=demo123",
      members: [{ name: "Ramesh Subramaniam", dob: "1985-06-15", gotra: "Kashyapa" }],
    },
    {
      ...base,
      orderId: "DEMO-LIVE4D", pujaName: "Pitra Dosh Nivaran Puja", pujaId: "pitra-dosh",
      packageName: "Elite – Extended Family",
      packagePrice: 11000, total: 12599, date: "Tue, 5 May", dateISO: "2026-05-05", time: "10:00 AM",
      transactionId: "TXN82841004", bookingTimestamp: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
      status: "live",
      videoLink: "https://meet.google.com/abc-defg-hij",
      members: [
        { name: "Ramesh Subramaniam", dob: "1985-06-15", gotra: "Kashyapa" },
        { name: "Sunita Subramaniam", dob: "1988-03-22", gotra: "Kashyapa" },
        { name: "Arjun Subramaniam", dob: "2012-08-10", gotra: "Kashyapa" },
      ],
    },
    {
      ...base,
      orderId: "DEMO-DONE5E", pujaName: "Lakshmi Puja", pujaId: "lakshmi",
      packageName: "Standard – Single Devotee",
      total: 6159, date: "Fri, 1 May", dateISO: "2026-05-01", time: "07:30 AM",
      transactionId: "TXN82841005", bookingTimestamp: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
      status: "completed",
      videoLink: "https://zoom.us/rec/demo-completed-recording",
      members: [{ name: "Ramesh Subramaniam", dob: "1985-06-15", gotra: "Kashyapa" }],
    },
  ];

  const existing = getOrders();
  const ids = new Set(existing.map((o) => o.orderId));
  const newOnes = demos.filter((d) => !ids.has(d.orderId));
  if (newOnes.length === 0) return;
  try { localStorage.setItem(KEY, JSON.stringify([...newOnes, ...existing])); } catch { /* noop */ }
}
