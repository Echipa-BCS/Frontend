import { create } from 'zustand';
import type {
  User,
  ComplexDto,
  CourtDto,
  OccupiedSlotDto,
  TemporaryReservationResponse,
  PaymentResponse,
  BookingSummaryDto,
  AbonamentDto,
  RegisterRequest,
  ProfileUpdateRequest,
} from '../types';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getStoredUser,
  isAuthenticated,
  getComplexeSportive,
  getTerenuri,
  getEchipamente,
  getOccupiedSlots,
  reserveTemporary,
  addEchipamentToRezervare,
  processSingleSessionPayment,
  processSubscriptionPayment,
  getMyBookings,
  cancelBooking,
  getMySubscriptions,
  purchaseSubscription,
  getProfile,
  updateProfile,
} from '../api/services';

export interface EquipmentItemUI {
  id: string;
  echipamentId: number;
  name: string;
  sportType: string;
  pricePerSession: number;
  availableCount: number;
  maxPerBooking: number;
  selectedCount: number;
  iconName: string;
}

function getErrMsg(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

interface BookingState {
  // Auth
  user: User | null;
  isAuth: boolean;
  isLoading: boolean;
  authError: string | null;

  // Catalog
  complexList: ComplexDto[];
  courts: CourtDto[];
  complexes: CourtDto[]; // kept for backward compatibility
  complexesLoading: boolean;
  catalogError: string | null;

  // Availability
  occupiedSlots: OccupiedSlotDto[];
  slotsLoading: boolean;

  // Booking Flow
  selectedCourt: CourtDto | null;
  reservation: TemporaryReservationResponse | null;
  courtNetPrice: number;
  paymentResult: PaymentResponse | null;
  bookingLoading: boolean;
  bookingError: string | null;

  // UI state
  selectedFacility: string;
  selectedCourtName: string;
  selectedDate: string;
  selectedTimeSlot: string;
  slotPrice: number;
  selectedEquipment: EquipmentItemUI[];
  syncedEquipmentIds: number[];
  paymentType: 'individual' | 'subscription';
  timerSeconds: number;

  // My Bookings
  myBookings: BookingSummaryDto[];
  myBookingsLoading: boolean;
  myBookingsError: string | null;

  // Subscriptions
  subscriptions: AbonamentDto[];
  subscriptionsLoading: boolean;
  subscriptionsError: string | null;

  // Auth & Profile actions
  login: (email: string, parola: string) => Promise<void>;
  register: (req: RegisterRequest) => Promise<void>;
  logout: () => void;
  initAuth: () => void;
  clearAuthError: () => void;
  fetchUserProfile: () => Promise<User | null>;
  saveUserProfile: (req: ProfileUpdateRequest) => Promise<User>;

  // Catalog actions
  fetchComplexeSportive: () => Promise<void>;
  fetchTerenuri: (location?: string, tipSport?: string) => Promise<void>;
  fetchEquipment: (complexId?: number) => Promise<void>;
  fetchOccupiedSlots: (date: string, terenId?: number) => Promise<void>;

  // Booking actions
  setSelectedCourt: (court: CourtDto | null) => void;
  selectSlot: (facility: string, court: string, date: string, time: string, price: number) => void;
  createTemporaryReservation: (
    utilizatorId: number,
    terenId: number,
    dataStart: string,
    dataEnd: string
  ) => Promise<TemporaryReservationResponse>;
  syncEquipmentToReservation: () => Promise<void>;
  confirmPaymentSingleSession: (
    utilizatorId: number,
    rezervareId: number,
    suma: number,
    metodaPlata: string
  ) => Promise<PaymentResponse>;
  confirmPaymentSubscription: (
    utilizatorId: number,
    rezervareId: number
  ) => Promise<PaymentResponse>;
  setPaymentType: (type: 'individual' | 'subscription') => void;
  clearBookingError: () => void;
  clearBookingFlow: () => void;
  resumeReservation: (booking: BookingSummaryDto) => void;

  // Equipment & Timer actions
  updateEquipmentCount: (id: string, count: number) => void;
  decrementTimer: () => void;
  resetTimer: () => void;

  // My Bookings actions
  fetchMyBookings: () => Promise<void>;
  cancelMyBooking: (id: number) => Promise<void>;

  // Subscriptions actions
  fetchSubscriptions: () => Promise<void>;
  buySubscription: (tip: 'GENERAL_ACCESS' | 'INTERVAL_FIX') => Promise<AbonamentDto>;
}

const defaultEquipment: EquipmentItemUI[] = [
  { id: '1', echipamentId: 1, name: 'Racheta de teni', sportType: 'Tenis', pricePerSession: 5, availableCount: 10, maxPerBooking: 4, selectedCount: 0, iconName: 'racket' },
  { id: '2', echipamentId: 2, name: 'Minge de fotbal', sportType: 'Fotbal', pricePerSession: 3, availableCount: 20, maxPerBooking: 5, selectedCount: 0, iconName: 'balls' },
  { id: '3', echipamentId: 3, name: 'Minge de baschet', sportType: 'Baschet', pricePerSession: 3, availableCount: 15, maxPerBooking: 5, selectedCount: 0, iconName: 'balls' },
  { id: '4', echipamentId: 4, name: 'Vest de echipa', sportType: 'Fotbal', pricePerSession: 2, availableCount: 30, maxPerBooking: 12, selectedCount: 0, iconName: 'vest' },
];

function computeRemainingSeconds(dataExpirareBlocaj?: string | null): number {
  if (!dataExpirareBlocaj) return 600;
  const iso = dataExpirareBlocaj.endsWith('Z') || dataExpirareBlocaj.includes('+')
    ? dataExpirareBlocaj
    : `${dataExpirareBlocaj}Z`;
  const expMs = new Date(iso).getTime();
  if (Number.isNaN(expMs)) return 600;
  const diffSec = Math.floor((expMs - Date.now()) / 1000);
  return Math.max(0, Math.min(600, diffSec > 0 ? diffSec : 600));
}

export const useBookingStore = create<BookingState>((set, get) => ({
  // Initial state
  user: null,
  isAuth: false,
  isLoading: false,
  authError: null,

  complexList: [],
  courts: [],
  complexes: [],
  complexesLoading: false,
  catalogError: null,

  occupiedSlots: [],
  slotsLoading: false,

  selectedCourt: null,
  reservation: null,
  courtNetPrice: 0,
  paymentResult: null,
  bookingLoading: false,
  bookingError: null,

  selectedFacility: 'Complexul Sportiv USV Suceava',
  selectedCourtName: '',
  selectedDate: '',
  selectedTimeSlot: '',
  slotPrice: 0,
  selectedEquipment: defaultEquipment,
  syncedEquipmentIds: [],
  paymentType: 'individual',
  timerSeconds: 600,

  myBookings: [],
  myBookingsLoading: false,
  myBookingsError: null,

  subscriptions: [],
  subscriptionsLoading: false,
  subscriptionsError: null,

  // Auth actions
  login: async (email, parola) => {
    set({ isLoading: true, authError: null });
    try {
      const { user } = await apiLogin(email, parola);
      set({ user, isAuth: true, isLoading: false, authError: null });
    } catch (err: unknown) {
      set({
        isLoading: false,
        authError: getErrMsg(err, 'Eroare neașteptată la autentificare.'),
      });
      throw err;
    }
  },

  register: async (req) => {
    set({ isLoading: true, authError: null });
    try {
      const { user } = await apiRegister(req);
      set({ user, isAuth: true, isLoading: false, authError: null });
    } catch (err: unknown) {
      set({
        isLoading: false,
        authError: getErrMsg(err, 'Eroare la înregistrare.'),
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
      courtNetPrice: 0,
      paymentResult: null,
      selectedEquipment: defaultEquipment.map((e) => ({ ...e, selectedCount: 0 })),
      syncedEquipmentIds: [],
      paymentType: 'individual',
      myBookings: [],
      subscriptions: [],
    });
  },

  initAuth: () => {
    if (isAuthenticated()) {
      const user = getStoredUser();
      if (user) set({ user, isAuth: true });
    }
  },

  clearAuthError: () => set({ authError: null }),

  fetchUserProfile: async () => {
    try {
      const user = await getProfile();
      set({ user, isAuth: true });
      return user;
    } catch {
      return get().user;
    }
  },

  saveUserProfile: async (req) => {
    const updated = await updateProfile(req);
    set({ user: updated });
    return updated;
  },

  // Catalog actions
  fetchComplexeSportive: async () => {
    try {
      const data = await getComplexeSportive();
      set({ complexList: data });
    } catch (err: unknown) {
      set({ catalogError: getErrMsg(err, 'Eroare la încărcarea complexelor.') });
    }
  },

  fetchTerenuri: async (location?, tipSport?) => {
    set({ complexesLoading: true, catalogError: null });
    try {
      const data = await getTerenuri(location, tipSport);
      set({ courts: data, complexes: data, complexesLoading: false });
    } catch (err: unknown) {
      set({
        complexesLoading: false,
        catalogError: getErrMsg(err, 'Eroare la încărcarea terenurilor.'),
      });
    }
  },

  fetchEquipment: async (complexId?) => {
    try {
      const items = await getEchipamente(complexId);
      const current = get().selectedEquipment;
      const mapped: EquipmentItemUI[] = items.map((e) => {
        const existing = current.find((c) => c.echipamentId === e.id);
        return {
          id: String(e.id),
          echipamentId: e.id,
          name: e.denumire,
          sportType: e.tipSport,
          pricePerSession: e.tarifInchirierePerOra,
          availableCount: e.stocTotal,
          maxPerBooking: Math.min(10, Math.max(1, e.stocTotal)),
          selectedCount: existing ? Math.min(existing.selectedCount, e.stocTotal) : 0,
          iconName: e.tipSport.toLowerCase(),
        };
      });
      if (mapped.length > 0) {
        set({ selectedEquipment: mapped });
      }
    } catch {
      // Keep defaultEquipment fallback if offline
    }
  },

  fetchOccupiedSlots: async (date, terenId?) => {
    set({ slotsLoading: true });
    try {
      const slots = await getOccupiedSlots(date, terenId);
      set({ occupiedSlots: slots, slotsLoading: false });
    } catch {
      set({ occupiedSlots: [], slotsLoading: false });
    }
  },

  // Booking actions
  setSelectedCourt: (court) =>
    set({
      selectedCourt: court,
      selectedFacility: court?.complexNume ?? 'Complexul Sportiv USV Suceava',
      selectedCourtName: court?.nume ?? '',
      slotPrice: court?.tarifOrarStandard ?? 0,
    }),

  selectSlot: (facility, court, date, time, price) =>
    set({
      selectedFacility: facility,
      selectedCourtName: court,
      selectedDate: date,
      selectedTimeSlot: time,
      slotPrice: price,
      timerSeconds: 600,
    }),

  createTemporaryReservation: async (utilizatorId, terenId, dataStart, dataEnd) => {
    set({ bookingLoading: true, bookingError: null, paymentResult: null });
    try {
      const reservation = await reserveTemporary({
        utilizatorId,
        terenId,
        dataStart,
        dataEnd,
      });
      const resetEquip = get().selectedEquipment.map((item) => ({
        ...item,
        selectedCount: 0,
      }));
      set({
        reservation,
        courtNetPrice: reservation.pretTotal,
        selectedEquipment: resetEquip,
        syncedEquipmentIds: [],
        timerSeconds: computeRemainingSeconds(reservation.dataExpirareBlocaj),
        bookingLoading: false,
      });
      return reservation;
    } catch (err: unknown) {
      set({
        bookingLoading: false,
        bookingError: getErrMsg(err, 'Slot-ul nu mai este disponibil.'),
      });
      throw err;
    }
  },

  syncEquipmentToReservation: async () => {
    const { reservation, selectedEquipment, syncedEquipmentIds } = get();
    if (!reservation) return;

    const toSync = selectedEquipment.filter(
      (item) => item.selectedCount > 0 || syncedEquipmentIds.includes(item.echipamentId)
    );
    if (toSync.length === 0) return;

    set({ bookingLoading: true, bookingError: null });
    try {
      let latestPretTotal = reservation.pretTotal;
      const newSynced: number[] = [];

      for (const item of toSync) {
        const res = await addEchipamentToRezervare(reservation.id, {
          echipamentId: item.echipamentId,
          cantitate: item.selectedCount,
        });
        if (typeof res.pretTotalRezervare === 'number') {
          latestPretTotal = res.pretTotalRezervare;
        }
        if (item.selectedCount > 0) {
          newSynced.push(item.echipamentId);
        }
      }

      set({
        reservation: {
          ...reservation,
          pretTotal: latestPretTotal,
        },
        syncedEquipmentIds: newSynced,
        bookingLoading: false,
      });
    } catch (err: unknown) {
      set({
        bookingLoading: false,
        bookingError: getErrMsg(err, 'Nu s-a putut adăuga echipamentul.'),
      });
      throw err;
    }
  },

  confirmPaymentSingleSession: async (utilizatorId, rezervareId, suma, metodaPlata) => {
    set({ bookingLoading: true, bookingError: null });
    try {
      const payment = await processSingleSessionPayment({
        utilizatorId,
        rezervareId,
        suma,
        metodaPlata,
      });
      const currentRes = get().reservation;
      set({
        paymentResult: payment,
        reservation: currentRes
          ? {
              ...currentRes,
              stare: payment.stareRezervare || 'CONFIRMATA',
              pretTotal: suma,
            }
          : null,
        bookingLoading: false,
      });
      return payment;
    } catch (err: unknown) {
      set({
        bookingLoading: false,
        bookingError: getErrMsg(err, 'Plata nu a putut fi procesată.'),
      });
      throw err;
    }
  },

  confirmPaymentSubscription: async (utilizatorId, rezervareId) => {
    set({ bookingLoading: true, bookingError: null });
    try {
      const payment = await processSubscriptionPayment({
        utilizatorId,
        rezervareId,
      });
      const currentRes = get().reservation;
      set({
        paymentResult: payment,
        reservation: currentRes
          ? {
              ...currentRes,
              stare: payment.stareRezervare || 'CONFIRMATA',
            }
          : null,
        bookingLoading: false,
      });
      return payment;
    } catch (err: unknown) {
      set({
        bookingLoading: false,
        bookingError: getErrMsg(err, 'Abonamentul nu a putut fi validat.'),
      });
      throw err;
    }
  },

  setPaymentType: (type) => set({ paymentType: type, bookingError: null }),

  clearBookingError: () => set({ bookingError: null }),

  clearBookingFlow: () =>
    set((state) => ({
      reservation: null,
      courtNetPrice: 0,
      paymentResult: null,
      bookingError: null,
      syncedEquipmentIds: [],
      selectedEquipment: state.selectedEquipment.map((item) => ({
        ...item,
        selectedCount: 0,
      })),
      timerSeconds: 600,
    })),

  resumeReservation: (booking) => {
    const equipSum = (booking.echipamente ?? []).reduce((acc, e) => acc + e.subtotalPret, 0);
    set((state) => ({
      reservation: {
        id: booking.id,
        codRezervare: booking.codRezervare,
        terenId: booking.terenId,
        dataStart: booking.dataStart,
        dataEnd: booking.dataEnd,
        stare: booking.stare,
        dataExpirareBlocaj: booking.dataExpirareBlocaj ?? '',
        pretTotal: booking.pretTotal,
        discountAplicat: booking.discountAplicat,
      },
      courtNetPrice: Math.max(0, booking.pretTotal - equipSum),
      selectedFacility: booking.complexNume,
      selectedCourtName: booking.terenNume,
      timerSeconds: computeRemainingSeconds(booking.dataExpirareBlocaj),
      selectedEquipment: state.selectedEquipment.map((item) => {
        const attached = booking.echipamente?.find((e) => e.echipamentId === item.echipamentId);
        return {
          ...item,
          selectedCount: attached ? attached.cantitate : 0,
        };
      }),
      syncedEquipmentIds: (booking.echipamente ?? []).map((e) => e.echipamentId),
    }));
  },

  // Equipment & Timer actions
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

  // My Bookings actions
  fetchMyBookings: async () => {
    set({ myBookingsLoading: true, myBookingsError: null });
    try {
      const data = await getMyBookings();
      set({ myBookings: data, myBookingsLoading: false });
    } catch (err: unknown) {
      set({
        myBookingsLoading: false,
        myBookingsError: getErrMsg(err, 'Nu s-au putut încărca rezervările.'),
      });
    }
  },

  cancelMyBooking: async (id) => {
    set({ myBookingsError: null });
    try {
      await cancelBooking(id);
      const currentRes = get().reservation;
      if (currentRes && currentRes.id === id) {
        get().clearBookingFlow();
      }
      await get().fetchMyBookings();
    } catch (err: unknown) {
      set({
        myBookingsError: getErrMsg(err, 'Rezervarea nu a putut fi anulată.'),
      });
      throw err;
    }
  },

  // Subscriptions actions
  fetchSubscriptions: async () => {
    set({ subscriptionsLoading: true, subscriptionsError: null });
    try {
      const data = await getMySubscriptions();
      set({ subscriptions: data, subscriptionsLoading: false });
    } catch (err: unknown) {
      set({
        subscriptionsLoading: false,
        subscriptionsError: getErrMsg(err, 'Nu s-au putut încărca abonamentele.'),
      });
    }
  },

  buySubscription: async (tip) => {
    set({ subscriptionsLoading: true, subscriptionsError: null });
    try {
      const created = await purchaseSubscription(tip);
      await get().fetchSubscriptions();
      return created;
    } catch (err: unknown) {
      set({
        subscriptionsLoading: false,
        subscriptionsError: getErrMsg(err, 'Eroare la achiziționarea abonamentului.'),
      });
      throw err;
    }
  },
}));
