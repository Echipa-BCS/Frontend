export type UserRole = 'student' | 'profesor' | 'extern';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isVerified: boolean;
}

export interface Facility {
  id: string;
  name: string;
  location: string;
  totalCourts: number;
  sports: string[];
  hasEquipmentRental: boolean;
  bgGradient: string;
}

export interface TimeSlot {
  id: string;
  courtId: string;
  courtName: string;
  time: string;
  status: 'free' | 'occupied' | 'selected' | 'processing';
  price: number;
}

export interface EquipmentItem {
  id: string;
  name: string;
  description: string;
  pricePerSession: number;
  availableCount: number;
  maxPerBooking: number;
  selectedCount: number;
  iconName: string;
}

export interface Booking {
  id: string;
  facilityName: string;
  courtName: string;
  date: string;
  timeSlot: string;
  equipment: { name: string; quantity: number }[];
  paymentType: 'individual' | 'subscription';
  totalPaid: number;
  status: 'active' | 'completed' | 'cancelled';
  discountApplied?: string;
}