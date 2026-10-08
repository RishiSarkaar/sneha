export type SpotType = 'standard' | 'ev' | 'accessible' | 'reserved' | 'twoWheeler';

export type SpotStatus = 'available' | 'occupied' | 'reserved';

export type ParkingDeckId = 'B1' | 'B2' | 'G' | 'P1' | 'ROOF';

export type VehicleCategory = '2-Wheeler (Bike/Scooter)' | '4-Wheeler (Car/SUV)' | 'Commercial/Cab' | 'EV 2-Wheeler' | 'EV 4-Wheeler';

export interface ParkingSpot {
  id: string; // e.g., 'B1-A01'
  deckId: ParkingDeckId;
  aisle: string; // 'A', 'B', 'C', 'D'
  spotNumber: number;
  type: SpotType;
  status: SpotStatus;
  currentVehicleId?: string;
  x: number;
  y: number;
}

export type PaymentMethod = 'UPI' | 'FASTag' | 'RuPay Card' | 'NetBanking' | 'Cash Booth';

export interface PaymentTransaction {
  transactionId: string; // e.g. 'UPI-9821873192' or 'FTG-881920'
  amount: number;
  method: PaymentMethod;
  timestamp: string;
  upiVpa?: string;
  fastagTagId?: string;
  gstBreakdown: {
    baseAmount: number;
    cgst: number; // 9%
    sgst: number; // 9%
    total: number;
  };
}

export interface ParkedVehicle {
  id: string; // unique ticket ID, e.g., 'APX-7821'
  plateNumber: string; // Indian HSRP format e.g., 'DL 01 AB 1234', 'MH 12 CD 5678'
  makeModel: string;
  color: string;
  vehicleType: VehicleCategory;
  deckId: ParkingDeckId;
  spotId: string;
  parkedAt: string; // ISO string
  expectedDurationHours: number;
  driverName?: string;
  contactPhone?: string;
  fastagId?: string; // e.g. 'FTAG-3498-8921-11'
  category: 'Visitor' | 'Staff/TechPark' | 'Executive' | 'Monthly Pass' | 'Valet';
  landmarkNote: string;
  checkedOutAt?: string;
  status: 'active' | 'departed' | 'overstay';
  totalFeePaid?: number;
  paymentDetails?: PaymentTransaction;
}

export interface FacilityDeck {
  id: ParkingDeckId;
  name: string;
  levelCode: string;
  description: string;
  totalCapacity: number;
  clearanceHeight: string;
  features: string[];
}

export interface PricingRates {
  hourlyRateCar: number; // in INR ₹
  hourlyRateBike: number; // in INR ₹
  firstThirtyMinutesFree: boolean;
  dailyMaximum: number; // in INR ₹
  overstayHourlyPenalty: number; // in INR ₹
  gstRatePercent: number; // 18% (9% CGST + 9% SGST)
}
