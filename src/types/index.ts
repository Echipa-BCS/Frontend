export type UserRole = 'USER' | 'STUDENT' | 'PROFESOR' | 'ADMIN';

export interface User {
  id: number;
  nume: string;
  prenume: string;
  email: string;
  telefon?: string | null;
  rol: UserRole;
  dataInregistrare?: string;
  data_inregistrare?: string;
}

export interface ComplexDto {
  id: number;
  nume: string;
  adresa: string;
  descriere?: string;
  oraDeschidere: string;
  oraInchidere: string;
}

export interface CourtDto {
  id: number;
  complexId: number;
  complexNume: string;
  nume: string;
  tipSport: string;
  esteAcoperit: boolean;
  tarifOrarStandard: number;
  durataMinimaOre: number;
}

export interface EchipamentDto {
  id: number;
  complexId: number;
  denumire: string;
  tipSport: string;
  stocTotal: number;
  tarifInchirierePerOra: number;
}

export interface RezervareEchipamentRequest {
  echipamentId: number;
  cantitate: number;
}

export interface RezervareEchipamentResponse {
  echipamentId: number;
  echipamentDenumire: string;
  cantitate: number;
  subtotalPret: number;
  pretTotalRezervare?: number;
}

export interface OccupiedSlotDto {
  id: number;
  terenId: number;
  utilizatorId: number;
  dataStart: string;
  dataEnd: string;
  stare: string;
  dataExpirareBlocaj?: string | null;
}

export interface TemporaryReservationRequest {
  utilizatorId: number;
  terenId: number;
  dataStart: string;
  dataEnd: string;
}

export interface TemporaryReservationResponse {
  id: number;
  codRezervare: string;
  terenId: number;
  dataStart: string;
  dataEnd: string;
  stare: string;
  dataExpirareBlocaj: string;
  pretTotal: number;
  discountAplicat: number;
}

export interface BookingSummaryDto {
  id: number;
  codRezervare: string;
  terenId: number;
  terenNume: string;
  tipSport: string;
  complexNume: string;
  dataStart: string;
  dataEnd: string;
  stare: 'TEMPORAR_BLOCATA' | 'CONFIRMATA' | 'EXPIRATA' | 'ANULATA' | 'FINALIZATA' | string;
  pretTotal: number;
  discountAplicat: number;
  dataExpirareBlocaj?: string | null;
  echipamente?: RezervareEchipamentResponse[];
}

export interface AbonamentDto {
  id: number;
  tip: 'GENERAL_ACCESS' | 'INTERVAL_FIX' | string;
  dataStart: string;
  dataExpirare: string;
  sedinteRamase: number;
  activ: boolean;
  utilizatorEmail?: string | null;
}

export interface PaymentRequest {
  utilizatorId: number;
  rezervareId: number;
  suma: number;
  metodaPlata: string;
}

export interface SubscriptionPaymentRequest {
  utilizatorId: number;
  rezervareId: number;
}

export interface PaymentResponse {
  plataId: number;
  stripeSessionId: string;
  rezervareId: number;
  stareRezervare: string;
  suma: number;
  stare: string;
  sedinteRamase?: number | null;
}

export interface ApiError {
  message?: string;
  error?: string;
  status?: number;
}

export interface LoginCredentials {
  email: string;
  parola: string;
}

export interface RegisterRequest {
  nume: string;
  prenume: string;
  email: string;
  parola: string;
  telefon?: string;
}

export interface ProfileUpdateRequest {
  nume: string;
  prenume: string;
  email: string;
  telefon?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
