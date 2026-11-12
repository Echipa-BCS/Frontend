import { apiClient } from './client';
import type {
  ComplexDto,
  CourtDto,
  EchipamentDto,
  OccupiedSlotDto,
  TemporaryReservationRequest,
  TemporaryReservationResponse,
  RezervareEchipamentRequest,
  RezervareEchipamentResponse,
  BookingSummaryDto,
  AbonamentDto,
  PaymentRequest,
  PaymentResponse,
  SubscriptionPaymentRequest,
  User,
  RegisterRequest,
  ProfileUpdateRequest,
  AuthResponse,
} from '../types';

/* ------------------------------------------------------------------ */
/* Auth                                                               */
/* ------------------------------------------------------------------ */

export async function login(email: string, parola: string): Promise<AuthResponse> {
  const credentials = { email, parola };
  const { data } = await apiClient.post<AuthResponse>('/api/auth/login', credentials);

  localStorage.setItem('campus_booking_token', data.token);
  localStorage.setItem('campus_booking_user', JSON.stringify(data.user));

  return data;
}

export async function register(req: RegisterRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/register', req);

  localStorage.setItem('campus_booking_token', data.token);
  localStorage.setItem('campus_booking_user', JSON.stringify(data.user));

  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>('/api/auth/me');
  localStorage.setItem('campus_booking_user', JSON.stringify(data));
  return data;
}

export function logout(): void {
  localStorage.removeItem('campus_booking_token');
  localStorage.removeItem('campus_booking_user');
  localStorage.removeItem('campus_booking_refresh_token');
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem('campus_booking_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('campus_booking_token');
}

/* ------------------------------------------------------------------ */
/* Catalog & Search                                                   */
/* ------------------------------------------------------------------ */

/** GET /api/complexe-sportive */
export async function getComplexeSportive(): Promise<ComplexDto[]> {
  const { data } = await apiClient.get<ComplexDto[]>('/api/complexe-sportive');
  return data;
}

/** GET /api/terenuri?location=&tipSport= */
export async function getTerenuri(
  location?: string,
  tipSport?: string
): Promise<CourtDto[]> {
  const params: Record<string, string> = {};
  if (location) params.location = location;
  if (tipSport) params.tipSport = tipSport;

  const { data } = await apiClient.get<CourtDto[]>('/api/terenuri', { params });
  return data;
}

/** GET /api/echipamente */
export async function getEchipamente(complexId?: number): Promise<EchipamentDto[]> {
  const params: Record<string, string | number> = {};
  if (complexId) params.complexId = complexId;
  const { data } = await apiClient.get<EchipamentDto[]>('/api/echipamente', { params });
  return data;
}

/* ------------------------------------------------------------------ */
/* Booking & Availability                                             */
/* ------------------------------------------------------------------ */

/** GET /api/rezervari/availability?date=YYYY-MM-DD&terenId= */
export async function getOccupiedSlots(
  date: string,
  terenId?: number
): Promise<OccupiedSlotDto[]> {
  const params: Record<string, string | number> = { date };
  if (terenId) params.terenId = terenId;
  const { data } = await apiClient.get<OccupiedSlotDto[]>('/api/rezervari/availability', { params });
  return data;
}

/** POST /api/rezervari/temporary */
export async function reserveTemporary(
  req: TemporaryReservationRequest
): Promise<TemporaryReservationResponse> {
  const { data } = await apiClient.post<TemporaryReservationResponse>(
    '/api/rezervari/temporary',
    req
  );
  return data;
}

/** POST /api/rezervari/{rezervareId}/echipamente */
export async function addEchipamentToRezervare(
  rezervareId: number,
  req: RezervareEchipamentRequest
): Promise<RezervareEchipamentResponse> {
  const { data } = await apiClient.post<RezervareEchipamentResponse>(
    `/api/rezervari/${rezervareId}/echipamente`,
    req
  );
  return data;
}

/* ------------------------------------------------------------------ */
/* User Bookings (My Reservations)                                    */
/* ------------------------------------------------------------------ */

/** GET /api/bookings */
export async function getMyBookings(): Promise<BookingSummaryDto[]> {
  const { data } = await apiClient.get<BookingSummaryDto[]>('/api/bookings');
  return data;
}

/** PUT /api/bookings/{id}/cancel */
export async function cancelBooking(
  id: number
): Promise<{ message: string; id: number; stare: string }> {
  const { data } = await apiClient.put<{ message: string; id: number; stare: string }>(
    `/api/bookings/${id}/cancel`
  );
  return data;
}

/* ------------------------------------------------------------------ */
/* Payments                                                           */
/* ------------------------------------------------------------------ */

/** POST /api/plati/single-session */
export async function processSingleSessionPayment(
  req: PaymentRequest
): Promise<PaymentResponse> {
  const { data } = await apiClient.post<PaymentResponse>(
    '/api/plati/single-session',
    req
  );
  return data;
}

/** POST /api/plati/subscription */
export async function processSubscriptionPayment(
  req: SubscriptionPaymentRequest
): Promise<PaymentResponse> {
  const { data } = await apiClient.post<PaymentResponse>(
    '/api/plati/subscription',
    req
  );
  return data;
}

/* ------------------------------------------------------------------ */
/* Subscriptions                                                      */
/* ------------------------------------------------------------------ */

/** GET /api/subscriptions */
export async function getMySubscriptions(): Promise<AbonamentDto[]> {
  const { data } = await apiClient.get<AbonamentDto[]>('/api/subscriptions');
  return data;
}

/** POST /api/subscriptions/purchase */
export async function purchaseSubscription(
  tip: 'GENERAL_ACCESS' | 'INTERVAL_FIX'
): Promise<AbonamentDto> {
  const { data } = await apiClient.post<AbonamentDto>('/api/subscriptions/purchase', { tip });
  return data;
}

/* ------------------------------------------------------------------ */
/* Profile                                                            */
/* ------------------------------------------------------------------ */

/** GET /api/profile */
export async function getProfile(): Promise<User> {
  const { data } = await apiClient.get<User>('/api/profile');
  localStorage.setItem('campus_booking_user', JSON.stringify(data));
  return data;
}

/** PUT /api/profile */
export async function updateProfile(req: ProfileUpdateRequest): Promise<User> {
  const { data } = await apiClient.put<User>('/api/profile', req);
  localStorage.setItem('campus_booking_user', JSON.stringify(data));
  return data;
}

/* ------------------------------------------------------------------ */
/* Health                                                             */
/* ------------------------------------------------------------------ */

export async function healthCheck(): Promise<{ status: string; database: string }> {
  const { data } = await apiClient.get<{ status: string; database: string }>('/health');
  return data;
}
