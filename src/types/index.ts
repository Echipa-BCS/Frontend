export type UserRole = 'USER' | 'STUDENT' | 'PROFESOR' | 'ADMIN';

export interface User {
  id: number;
  nume: string;
  prenume: string;
  email: string;
  telefon: string;
  rol: UserRole;
  data_inregistrare: string;
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
  sedinteRamase?: number;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface LoginCredentials {
  email: string;
  parola: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
