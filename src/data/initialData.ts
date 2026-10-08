import { FacilityDeck, ParkingSpot, ParkedVehicle, PricingRates } from '../types/parking';

export const INITIAL_DECKS: FacilityDeck[] = [
  {
    id: 'G',
    name: 'Ground Level - Tech Concourse',
    levelCode: 'G',
    description: 'Immediate pedestrian access to Main Tower Atrium, 2-Wheeler Zone & FASTag Express Lane.',
    totalCapacity: 24,
    clearanceHeight: '3.20 m (10ft 6in)',
    features: ['FASTag RFID Toll Boom', '2-Wheeler Dedicated Wing', 'Main Atrium Entry', 'UPI Automated Kiosk'],
  },
  {
    id: 'B1',
    name: 'Basement 1 - EV & Executive Deck',
    levelCode: 'B1',
    description: 'High-speed EV Charging Hub (Tata Power / Jio-bp 60kW DC Fast & 15A 2W points), VIP & Visitor bays.',
    totalCapacity: 24,
    clearanceHeight: '2.40 m (7ft 10in)',
    features: ['Tata Power EV Fast Chargers', 'Elevator Bank A & B', 'Security Booth #1'],
  },
  {
    id: 'B2',
    name: 'Basement 2 - Fleet & Staff Deck',
    levelCode: 'B2',
    description: 'Long-stay employee corporate parking, monthly pass holders, and reserved staff parking.',
    totalCapacity: 24,
    clearanceHeight: '2.25 m (7ft 4in)',
    features: ['Corporate Fleet Reserve', 'CCTV Surveillance 360', 'Elevator Bank A'],
  },
  {
    id: 'ROOF',
    name: 'Level R - SkyDeck Rooftop',
    levelCode: 'ROOF',
    description: 'Open-air panoramic parking with solar panel canopies and oversized commercial vehicle bays.',
    totalCapacity: 16,
    clearanceHeight: 'Open Sky (No limit)',
    features: ['Solar Canopy', 'East Stairwell', 'West Fire Exit'],
  },
];

export const INITIAL_PRICING: PricingRates = {
  hourlyRateCar: 40, // ₹40/hour for 4W
  hourlyRateBike: 15, // ₹15/hour for 2W
  firstThirtyMinutesFree: true,
  dailyMaximum: 250, // ₹250 max per day
  overstayHourlyPenalty: 60, // ₹60/hour penalty
  gstRatePercent: 18, // 18% GST (9% CGST + 9% SGST)
};

// Generate layout grid for spots
export function generateInitialSpots(): ParkingSpot[] {
  const spots: ParkingSpot[] = [];

  // Ground Level (G): 24 spots (includes dedicated 2-Wheeler bays in Aisle A & B)
  const gAisles = ['A', 'B', 'C', 'D'];
  gAisles.forEach((aisle, aisleIdx) => {
    for (let i = 1; i <= 6; i++) {
      const id = `G-${aisle}0${i}`;
      let type: ParkingSpot['type'] = 'standard';
      if (aisle === 'A') {
        type = 'twoWheeler'; // Dedicated Two Wheeler rows
      } else if (aisle === 'B' && (i === 1 || i === 2)) {
        type = 'accessible';
      } else if (aisle === 'C' && (i === 1 || i === 2)) {
        type = 'ev';
      }

      spots.push({
        id,
        deckId: 'G',
        aisle,
        spotNumber: i,
        type,
        status: 'available',
        x: aisleIdx * 2 + 1,
        y: i,
      });
    }
  });

  // Basement 1 (B1): 24 spots (EV and standard)
  const b1Aisles = ['A', 'B', 'C', 'D'];
  b1Aisles.forEach((aisle, aisleIdx) => {
    for (let i = 1; i <= 6; i++) {
      const id = `B1-${aisle}0${i}`;
      let type: ParkingSpot['type'] = 'standard';
      if ((aisle === 'A' || aisle === 'B') && i <= 3) {
        type = 'ev';
      } else if (aisle === 'C' && i === 1) {
        type = 'accessible';
      } else if (aisle === 'D' && (i === 1 || i === 2)) {
        type = 'reserved';
      }

      spots.push({
        id,
        deckId: 'B1',
        aisle,
        spotNumber: i,
        type,
        status: 'available',
        x: aisleIdx * 2 + 1,
        y: i,
      });
    }
  });

  // Basement 2 (B2): 24 spots (Corporate staff & monthly passes)
  const b2Aisles = ['A', 'B', 'C', 'D'];
  b2Aisles.forEach((aisle, aisleIdx) => {
    for (let i = 1; i <= 6; i++) {
      const id = `B2-${aisle}0${i}`;
      let type: ParkingSpot['type'] = 'standard';
      if (aisle === 'A' && (i === 1 || i === 2)) type = 'reserved';
      if (aisle === 'B' && i === 1) type = 'accessible';

      spots.push({
        id,
        deckId: 'B2',
        aisle,
        spotNumber: i,
        type,
        status: 'available',
        x: aisleIdx * 2 + 1,
        y: i,
      });
    }
  });

  // SkyDeck Rooftop (ROOF): 16 spots
  const roofAisles = ['A', 'B', 'C', 'D'];
  roofAisles.forEach((aisle, aisleIdx) => {
    for (let i = 1; i <= 4; i++) {
      const id = `ROOF-${aisle}0${i}`;
      spots.push({
        id,
        deckId: 'ROOF',
        aisle,
        spotNumber: i,
        type: 'standard',
        status: 'available',
        x: aisleIdx * 2 + 1,
        y: i,
      });
    }
  });

  return spots;
}

// Generate realistic active vehicles in India
export function generateInitialVehicles(): ParkedVehicle[] {
  const now = Date.now();
  const hoursAgo = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'APX-5120',
      plateNumber: 'DL 01 AB 4029',
      makeModel: 'Tata Nexon EV Max',
      color: 'Intensi-Teal',
      vehicleType: 'EV 4-Wheeler',
      deckId: 'B1',
      spotId: 'B1-A01',
      parkedAt: hoursAgo(2.3),
      expectedDurationHours: 4,
      driverName: 'Rohan Sharma',
      contactPhone: '+91 98101 23456',
      fastagId: 'NETC-3401-9921-12',
      category: 'Visitor',
      landmarkNote: 'Plugged in at Tata Power 60kW DC Charger #1, next to East Elevator',
      status: 'active',
    },
    {
      id: 'APX-5125',
      plateNumber: 'KA 05 MN 7812',
      makeModel: 'Ather 450X Gen 3',
      color: 'Space Grey',
      vehicleType: 'EV 2-Wheeler',
      deckId: 'G',
      spotId: 'G-A01',
      parkedAt: hoursAgo(1.5),
      expectedDurationHours: 3,
      driverName: 'Priya Venkatesh',
      contactPhone: '+91 98450 87123',
      fastagId: 'NETC-7712-4019-88',
      category: 'Staff/TechPark',
      landmarkNote: 'Ground Level 2-Wheeler Bay #1, adjacent to security frisking booth',
      status: 'active',
    },
    {
      id: 'APX-5118',
      plateNumber: 'MH 12 CD 9034',
      makeModel: 'Hyundai Creta SX(O)',
      color: 'Polar White',
      vehicleType: '4-Wheeler (Car/SUV)',
      deckId: 'B1',
      spotId: 'B1-B02',
      parkedAt: hoursAgo(3.6),
      expectedDurationHours: 4,
      driverName: 'Vikramaditya Deshmukh',
      contactPhone: '+91 98220 54129',
      fastagId: 'NETC-8819-2041-55',
      category: 'Visitor',
      landmarkNote: 'Column C3, facing Elevator Bank A lobby',
      status: 'active',
    },
    {
      id: 'APX-5112',
      plateNumber: 'TS 08 EF 6721',
      makeModel: 'Royal Enfield Hunter 350',
      color: 'Dapper Ash',
      vehicleType: '2-Wheeler (Bike/Scooter)',
      deckId: 'G',
      spotId: 'G-A02',
      parkedAt: hoursAgo(4.8),
      expectedDurationHours: 4,
      driverName: 'Arjun Reddy',
      contactPhone: '+91 98850 33412',
      fastagId: '',
      category: 'Staff/TechPark',
      landmarkNote: 'Bike Row A, near entry barrier gate #2',
      status: 'overstay',
    },
    {
      id: 'APX-5130',
      plateNumber: 'TN 09 PQ 2244',
      makeModel: 'Mahindra XUV700 AX7L',
      color: 'Midnight Black',
      vehicleType: '4-Wheeler (Car/SUV)',
      deckId: 'B1',
      spotId: 'B1-A02',
      parkedAt: hoursAgo(0.8),
      expectedDurationHours: 2,
      driverName: 'Karthik Subramanian',
      contactPhone: '+91 98401 99234',
      fastagId: 'NETC-1092-8834-01',
      category: 'Executive',
      landmarkNote: 'Basement 1 VIP bay, direct ramp access to Tower B',
      status: 'active',
    },
    {
      id: 'APX-5098',
      plateNumber: 'HR 26 DQ 8840',
      makeModel: 'Maruti Suzuki Dzire CNG (Cab)',
      color: 'Silky Silver',
      vehicleType: 'Commercial/Cab',
      deckId: 'ROOF',
      spotId: 'ROOF-A01',
      parkedAt: hoursAgo(5.2),
      expectedDurationHours: 8,
      driverName: 'Satish Kumar',
      contactPhone: '+91 98110 44210',
      fastagId: 'NETC-9921-3412-76',
      category: 'Visitor',
      landmarkNote: 'Rooftop West canopy, commercial staging bay',
      status: 'active',
    },
    {
      id: 'APX-5085',
      plateNumber: 'GJ 01 KL 5566',
      makeModel: 'Kia Seltos Facelift',
      color: 'Gravity Gray',
      vehicleType: '4-Wheeler (Car/SUV)',
      deckId: 'B2',
      spotId: 'B2-A01',
      parkedAt: hoursAgo(6.7),
      expectedDurationHours: 8,
      driverName: 'Nirav Patel',
      contactPhone: '+91 98250 11982',
      fastagId: 'NETC-4412-9901-32',
      category: 'Monthly Pass',
      landmarkNote: 'Reserved Staff Bay #1 near South Stairwell',
      status: 'active',
    },
    {
      id: 'APX-5079',
      plateNumber: 'UP 16 AX 1234',
      makeModel: 'TVS Jupiter 125',
      color: 'Titanium Grey',
      vehicleType: '2-Wheeler (Bike/Scooter)',
      deckId: 'G',
      spotId: 'G-A03',
      parkedAt: hoursAgo(7.9),
      expectedDurationHours: 6,
      driverName: 'Anil Gupta',
      contactPhone: '+91 98990 66231',
      fastagId: '',
      category: 'Visitor',
      landmarkNote: 'Aisle A Two Wheeler bay, next to security cabin',
      status: 'overstay',
    },
  ];
}
