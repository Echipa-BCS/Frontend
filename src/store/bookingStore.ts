import { create } from 'zustand';
import type { User, CourtDto, TemporaryReservationResponse, PaymentResponse } from '../types';
import {
  login as apiLogin,
  logout as apiLogout,
  getStoredUser,
  isAuthenticated,
  getComplexeSportive,
  getTerenuri,
  reserveTemporary,
  processSingleSessionPayment,
  processSubscriptionPayment,
} from '../api/services';

interface BookingState {
  // Auth
  user: User | null;
  isAuth: boolean;
  isLoading: boolean;
  authError: string | null;

  // Catalog
  complexes: CourtDto[]; // reused for search results
  complexesLoading: boolean;
  catalogError: string | null;

  // Booking
  selectedCourt: CourtDto | null;
  reservation: TemporaryReservationResponse | null;
  bookingLoading: boolean;
  bookingError: string | null;

  // UI state from original store (kept for compatibility)
  selectedFacility: string;
  selectedCourtName: string;
  selectedDate: string;
  selectedTimeSlot: string;
  slotPrice: number;
  selectedEquipment: { id: string; name: string; pricePerSession: number; availableCount: number; maxPerBooking: number; selectedCount: number; iconName: string }[];
  paymentType: 'individual' | 'subscription';
  timerSeconds: number;

  // Auth actions
  login: (email: string, parola: string) => Promise<void>;
  logout: () => void;
  initAuth: () => void;

  // Catalog actions
  fetchComplexeSportive: () => Promise<void>;
  fetchTerenuri: (location?: string, tipSport?: string) => Promise<void>;

  // Booking actions
  selectSlot: (facility: string, court: string, date: string, time: string, price: number) => void;
  createTemporaryReservation: (utilizatorId: number, terenId: number, dataStart: string, dataEnd: string) => Promise<void>;
  confirmPaymentSingleSession: (utilizatorId: number, rezervareId: number, suma: number, metodaPlata: string) => Promise<void>;
  confirmPaymentSubscription: (utilizatorId: number, rezervareId: number) => Promise<void>;

  // Equipment actions (kept from original)
  updateEquipmentCount: (id: string, count: number) => void;
  decrementTimer: () => void;
  resetTimer: () => void;
}

const initialEquipment = [
  { id: '1', name: 'Rachetă tenis', pricePerSession: 10, availableCount: 4, maxPerBooking: 4, selectedCount: 1, iconName: 'racket' },
  { id: '2', name: 'Set mingi tenis', pricePerSession: 5, availableCount: 8, maxPerBooking: 8, selectedCount: 0, iconName: 'balls' },
  { id: '3', name: 'Rachetă tenis copii', pricePerSession: 8, availableCount: 3, maxPerBooking: 3, selectedCount: 0, iconName: 'racket-kids' },
  { id: '4', name: 'Coș pentru mingi', pricePerSession: 6, availableCount: 2, maxPerBooking: 2, selectedCount: 0, iconName: 'basket' },
];

export const useBookingStore = create<BookingState>((set) => ({
  // Initial state
  user: null,
  isAuth: false,
  isLoading: false,
  authError: null,

  complexes: [],
  complexesLoading: false,
  catalogError: null,

  selectedCourt: null,
  reservation: null,
  bookingLoading: false,
  bookingError: null,

  selectedFacility: 'Complexul Sportiv USV Suceava',
  selectedCourtName: '',
  selectedDate: '',
  selectedTimeSlot: '',
  slotPrice: 0,
  selectedEquipment: initialEquipment,
  paymentType: 'individual',
  timerSeconds: 600, // 10 minutes (matches backend TEMPORAR_BLOCATA expiry)

  // Auth actions
  login: async (email, parola) => {
    set({ isLoading: true, authError: null });
    try {
      const { user } = await apiLogin(email, parola);
      set({ user, isAuth: true, isLoading: false, authError: null });
    } catch (err: any) {
      set({
        isLoading: false,
        authError: err?.message ?? 'Eroare neașteptată la autentificare.',
      });
      throw err;
    }
  },

  logout: () => {
    apiLogout();
    set({
      user: null,
      isAuth: false,
      reservation: null,
      selectedEquipment: initialEquipment,
      paymentType: 'individual',
    });
  },

  initAuth: () => {
    if (isAuthenticated()) {
      const user = getStoredUser();
      if (user) set({ user, isAuth: true });
    }
  },

  // Catalog actions
  fetchComplexeSportive: async () => {
    set({ complexesLoading: true, catalogError: null });
    try {
      const data = await getComplexeSportive();
      set({ complexes: data, complexesLoading: false });
    } catch (err: any) {
      set({ complexesLoading: false, catalogError: err?.message ?? 'Eroare la încărcarea complexelor.' });
    }
  },

  fetchTerenuri: async (location?, tipSport?) => {
    set({ complexesLoading: true, catalogError: null });
    try {
      const data = await getTerenuri(location, tipSport);
      set({ complexes: data, complexesLoading: false });
    } catch (err: any) {
      set({ complexesLoading: false, catalogError: err?.message ?? 'Eroare la încărcarea terenurilor.' });
    }
  },

  // UI / slot selection (original behavior kept)
  selectSlot: (facility, court, date, time, price) =>
    set({
      selectedFacility: facility,
      selectedCourtName: court,
      selectedDate: date,
      selectedTimeSlot: time,
      slotPrice: price,
      timerSeconds: 600,
    }),

  // Booking API actions
  createTemporaryReservation: async (utilizatorId, terenId, dataStart, dataEnd) => {
    set({ bookingLoading: true, bookingError: null });
    try {
      const reservation = await reserveTemporary({ utilizatorId, terenId, dataStart, dataEnd });
      set({ reservation, bookingLoading: false });
    } catch (err: any) {
      set({ bookingLoading: false, bookingError: err?.message ?? 'Slot-ul nu mai este disponibil.' });
      throw err;
    }
  },

  confirmPaymentSingleSession: async (utilizatorId, rezervareId, suma, metodaPlata) => {
    set({ bookingLoading: true, bookingError: null });
    try {
      const payment = await processSingleSessionPayment({ utilizatorId, rezervareId, suma, metodaPlata });
      set({ reservation: { ...(payment as any) }, bookingLoading: false });
    } catch (err: any) {
      set({ bookingLoading: false, bookingError: err?.message ?? 'Plata nu a putut fi procesată.' });
      throw err;
    }
  },

  confirmPaymentSubscription: async (utilizatorId, rezervareId) => {
    set({ bookingLoading: true, bookingError: null });
    try {
      const payment = await processSubscriptionPayment({ utilizatorId, rezervareId });
      set({ reservation: { ...(payment as any) }, bookingLoading: false });
    } catch (err: any) {
      set({ bookingLoading: false, bookingError: err?.message ?? 'Abonamentul nu a putut fi validat.' });
      throw err;
    }
  },

  // Equipment actions
  updateEquipmentCount: (id, count) =>
    set((state) => ({
      selectedEquipment: state.selectedEquipment.map((item) =>
        item.id === id ? { ...item, selectedCount: count } : item
      ),
    })),

  decrementTimer: () =>
    set((state) => ({
      timerSeconds: state.timerSeconds > 0 ? state.timerSeconds - 1 : 0,
    })),

  resetTimer: () => set({ timerSeconds: 600 }),
}));
