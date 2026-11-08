import { create } from 'zustand';
import type { User, Booking, EquipmentItem } from '../types';

interface BookingState {
  user: User;
  selectedFacility: string;
  selectedCourt: string;
  selectedDate: string;
  selectedTimeSlot: string;
  slotPrice: number;
  selectedEquipment: EquipmentItem[];
  paymentType: 'individual' | 'subscription';
  timerSeconds: number;
  myBookings: Booking[];
  
  // Acțiuni
  setSelectedSlot: (facility: string, court: string, date: string, time: string, price: number) => void;
  updateEquipmentCount: (id: string, count: number) => void;
  setPaymentType: (type: 'individual' | 'subscription') => void;
  decrementTimer: () => void;
  resetTimer: () => void;
  addBooking: (booking: Booking) => void;
  cancelBooking: (id: string) => void;
}

const initialEquipment: EquipmentItem[] = [
  { id: '1', name: 'Rachetă tenis', description: 'Rachetă standard, adulți', pricePerSession: 10, availableCount: 4, maxPerBooking: 4, selectedCount: 1, iconName: 'racket' },
  { id: '2', name: 'Set mingi tenis', description: '3 mingi noi', pricePerSession: 5, availableCount: 8, maxPerBooking: 8, selectedCount: 0, iconName: 'balls' },
  { id: '3', name: 'Rachetă tenis copii', description: 'Pentru jucători sub 12 ani', pricePerSession: 8, availableCount: 3, maxPerBooking: 3, selectedCount: 0, iconName: 'racket-kids' },
  { id: '4', name: 'Coș pentru mingi', description: 'Util pentru antrenamente', pricePerSession: 6, availableCount: 2, maxPerBooking: 2, selectedCount: 0, iconName: 'basket' },
];

const mockInitialBookings: Booking[] = [
  {
    id: '#RZ-291026-0217',
    facilityName: 'Complex Sportiv X',
    courtName: 'Teren 2 · Tenis',
    date: 'Joi, 29 Oct 2026',
    timeSlot: '10:00 - 11:00',
    equipment: [{ name: 'Rachetă tenis', quantity: 1 }],
    paymentType: 'individual',
    totalPaid: 35,
    status: 'active'
  },
  {
    id: '#RZ-311026-0094',
    facilityName: 'Complex Sportiv X',
    courtName: 'Teren 1 · Fotbal',
    date: 'Sâm, 31 Oct 2026',
    timeSlot: '18:00 - 19:00',
    equipment: [],
    paymentType: 'subscription',
    totalPaid: 0,
    status: 'active'
  }
];

export const useBookingStore = create<BookingState>((set) => ({
  user: {
    id: 'u1',
    name: 'Ion Popescu',
    email: 'nume@exemplu.ro',
    phone: '+40 700 000 000',
    role: 'student',
    isVerified: true,
  },
  selectedFacility: 'Complex Sportiv X',
  selectedCourt: 'Teren 2 · Tenis',
  selectedDate: 'Joi, 29 Oct 2026',
  selectedTimeSlot: '10:00 - 11:00',
  slotPrice: 60,
  selectedEquipment: initialEquipment,
  paymentType: 'individual',
  timerSeconds: 300, // 5 minute
  myBookings: mockInitialBookings,

  setSelectedSlot: (facility, court, date, time, price) => set({
    selectedFacility: facility,
    selectedCourt: court,
    selectedDate: date,
    selectedTimeSlot: time,
    slotPrice: price,
    timerSeconds: 300
  }),

  updateEquipmentCount: (id, count) => set((state) => ({
    selectedEquipment: state.selectedEquipment.map((item) =>
      item.id === id ? { ...item, selectedCount: count } : item
    )
  })),

  setPaymentType: (type) => set({ paymentType: type }),

  decrementTimer: () => set((state) => ({
    timerSeconds: state.timerSeconds > 0 ? state.timerSeconds - 1 : 0
  })),

  resetTimer: () => set({ timerSeconds: 300 }),

  addBooking: (booking) => set((state) => ({
    myBookings: [booking, ...state.myBookings]
  })),

  cancelBooking: (id) => set((state) => ({
    myBookings: state.myBookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b)
  }))
}));