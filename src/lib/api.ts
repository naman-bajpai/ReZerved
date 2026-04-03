/**
 * BookedUp API client
 * Wraps all backend API calls with the business ID header.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const BUSINESS_ID = process.env.NEXT_PUBLIC_BUSINESS_ID || '';

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Business-ID': BUSINESS_ID,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error ${res.status}`);
  }

  return res.json();
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function getBookings(params: { status?: string; date?: string } = {}) {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<{ bookings: Booking[]; count: number }>(`/api/bookings?${q}`);
}

export async function updateBookingStatus(id: string, status: 'confirmed' | 'cancelled' | 'no_show', reason?: string) {
  return apiFetch<{ booking: Booking }>(`/api/bookings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason }),
  });
}

// ─── Clients ──────────────────────────────────────────────────────────────────

export async function getClients(params: { search?: string } = {}) {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<{ clients: Client[]; count: number }>(`/api/clients?${q}`);
}

export async function getClient(id: string) {
  return apiFetch<{ client: Client; bookings: Booking[] }>(`/api/clients/${id}`);
}

// ─── Availability ─────────────────────────────────────────────────────────────

export async function getAvailableSlots(serviceId: string, dateFrom: string, dateTo: string) {
  return apiFetch<{ slots: Slot[]; count: number }>(
    `/api/availability?service_id=${serviceId}&date_from=${dateFrom}&date_to=${dateTo}`
  );
}

export async function getSchedule() {
  return apiFetch<{ schedule: AvailabilityRecord[] }>('/api/availability/schedule');
}

// ─── Services ─────────────────────────────────────────────────────────────────

export async function getServices() {
  return apiFetch<{ services: Service[] }>('/api/services');
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getAnalytics(period: '7d' | '30d' | '90d' = '30d') {
  return apiFetch<Analytics>(`/api/analytics?period=${period}`);
}

export async function triggerSlotFiller(startsAt: string) {
  return apiFetch('/api/slot-filler/trigger', {
    method: 'POST',
    body: JSON.stringify({ starts_at: startsAt }),
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Booking {
  id: string;
  business_id: string;
  client_id: string;
  service_id: string;
  starts_at: string;
  ends_at: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired' | 'no_show';
  add_ons: AddOn[];
  total_price: number;
  source_channel: 'sms' | 'instagram';
  created_at: string;
  clients?: { name: string; phone: string };
  services?: { name: string; price: number; duration_mins: number };
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  instagram_id: string;
  notes: string;
  avg_spend: number;
  last_booked_at: string;
  typical_frequency_days: number;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  duration_mins: number;
  price: number;
  add_ons: AddOn[];
  is_active: boolean;
}

export interface AddOn {
  name: string;
  price: number;
  duration_mins: number;
}

export interface Slot {
  startsAt: string;
  endsAt: string;
  label: string;
}

export interface AvailabilityRecord {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface Analytics {
  period: string;
  revenue: { total: string; avgPerBooking: string; confirmedCount: number };
  bookings: { breakdown: Record<string, number>; noShowRate: string; total: number };
  busiestDays: Array<{ day: string; count: number }>;
  topClients: Client[];
  upcoming: Booking[];
}
