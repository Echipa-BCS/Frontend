import { apiClient, API_BASE_URL } from './client';
import type {
  ComplexDto,
  CourtDto,
  TemporaryReservationRequest,
  TemporaryReservationResponse,
  PaymentRequest,
  PaymentResponse,
  SubscriptionPaymentRequest,
  User,
  LoginCredentials,
  AuthResponse,
} from '../types';

/* ------------------------------------------------------------------ */
/* Auth                                                               */
/* ------------------------------------------------------------------ */

/**
 * Login: calls backend POST /api/auth/login and returns JWT + user.
 */
export async function login(email: string, parola: string): Promise<AuthResponse> {
  const credentials = { email, parola };
  const { data } = await apiClient.post<AuthResponse>('/api/auth/login', credentials);

  localStorage.setItem('campus_booking_token', data.token);
  localStorage.setItem('campus_booking_user', JSON.stringify(data.user));

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

/* ------------------------------------------------------------------ */
/* Booking                                                            */
/* ------------------------------------------------------------------ */

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
/* Health                                                             */
/* ------------------------------------------------------------------ */

export async function healthCheck(): Promise<{ status: string; database: string }> {
  const { data } = await apiClient.get<{ status: string; database: string }>('/health');
  return data;
}
