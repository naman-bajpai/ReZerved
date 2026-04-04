/**
 * BookedUp API client — Bearer token from Auth0, or legacy X-Business-ID for local dev.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const LEGACY_BUSINESS_ID = process.env.NEXT_PUBLIC_BUSINESS_ID || '';

export type ApiTokenGetter = () => Promise<string | null>;

let getAccessToken: ApiTokenGetter | null = null;

export function setApiTokenGetter(fn: ApiTokenGetter | null) {
  getAccessToken = fn;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken ? await getAccessToken() : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (LEGACY_BUSINESS_ID) {
    headers['X-Business-ID'] = LEGACY_BUSINESS_ID;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    const message = (err as { error?: string }).error || `API error ${res.status}`;
    const e = new Error(message) as Error & { status?: number; code?: string };
    e.status = res.status;
    if ((err as { code?: string }).code) e.code = (err as { code?: string }).code!;
    throw e;
  }

  return res.json();
}

// ─── Session / onboarding ───────────────────────────────────────────────────

export async function getMe() {
  return apiFetch<{
    profile: {
      id: string;
      email: string | null;
      name: string | null;
      picture_url: string | null;
      is_admin: boolean;
      business_id: string | null;
      created_at: string;
    };
    business: {
      id: string;
      name: string;
      timezone: string;
      external_booking_url: string | null;
    } | null;
  }>('/api/me');
}

export async function onboardingCreator(body: { business_name: string; timezone?: string }) {
  return apiFetch<{
    profile: { id: string; business_id: string; is_admin: boolean };
    business: { id: string; name: string; timezone: string; external_booking_url: string | null };
  }>('/api/onboarding/creator', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function patchBookingLink(external_booking_url: string | null) {
  return apiFetch<{ business: { id: string; external_booking_url: string | null } }>(
    '/api/creator/booking-link',
    {
      method: 'PATCH',
      body: JSON.stringify({ external_booking_url }),
    }
  );
}

export async function getAdminUsers() {
  return apiFetch<{ users: AdminUser[]; count: number }>('/api/admin/users');
}

export interface AdminUser {
  id: string;
  auth0_sub: string;
  email: string | null;
  name: string | null;
  picture_url: string | null;
  is_admin: boolean;
  business_id: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function getBookings(params: { status?: string; date?: string } = {}) {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<{ bookings: Booking[]; count: number }>(`/api/bookings?${q}`);
}

export async function updateBookingStatus(
  id: string,
  status: 'confirmed' | 'cancelled' | 'no_show',
  reason?: string
) {
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
