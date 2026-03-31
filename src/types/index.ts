export interface Bus {
  id: string;
  plateNumber: string;
  driver: string;
  route: string;
  status: 'active' | 'idle' | 'maintenance';
  currentPassengers: number;
  maxCapacity: number;
  location: {
    lat: number;
    lng: number;
    lastUpdated: Date;
  };
  currentTrip?: string;
  qrCodeId: string; // Permanent unique QR code identifier
}

export interface Trip {
  id: string;
  busId: string;
  busPlateNumber: string;
  driver: string;
  route: string;
  startTime: Date;
  endTime?: Date;
  status: 'ongoing' | 'completed';
  passengersBoarded: number;
  totalFare: number;
  stops: TripStop[];
}

export interface TripStop {
  id: string;
  location: string;
  time: Date;
  passengersOn: number;
  passengersOff: number;
  fare: number;
}

export interface Passenger {
  id: string;
  qrCode: string;
  boardingTime: Date;
  boardingLocation: string;
  destination?: string;
  fare: number;
  tripId: string;
}

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  stops: string[];
  baseFare: number;
  estimatedDuration: number; // minutes
}

export interface DailyReport {
  date: Date;
  totalTrips: number;
  totalPassengers: number;
  totalRevenue: number;
  busUtilization: number; // percentage
  averageTripDuration: number;
  peakHours: string[];
}

export interface LostAndFoundItem {
  id: string;
  itemName: string;
  description: string;
  category: 'electronics' | 'bag' | 'clothing' | 'documents' | 'accessories' | 'other';
  dateFound: Date;
  busPlateNumber: string;
  route: string;
  foundBy: string; // conductor/driver name
  status: 'unclaimed' | 'claimed' | 'disposed';
  claimedBy?: string;
  claimedDate?: Date;
  contactInfo?: string;
  imageUrl?: string;
  location?: string; // where in the bus it was found
}
