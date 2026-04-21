export interface Passenger {
  id: string;
  ticketNumber: string;
  boardingPoint: string;
  destination: string;
  fare: number;
  timestamp: Date | string;
  paymentMethod: 'cash' | 'digital';
  passengerCount: number;
}

export interface BusInfo {
  id: string;
  plateNumber: string;
  route: string;
  driver: string;
  capacity: number;
}

export interface LostItem {
  itemName: string;
  description: string;
  category: string;
  location: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export type BusStatus = 'on-time' | 'delayed' | 'emergency' | 'stopped';

export interface TripState {
  isActive: boolean;
  tripId: string | null;
  passengers: Passenger[];
}
