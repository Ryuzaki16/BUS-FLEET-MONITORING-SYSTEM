import { BASE_URL, publicAnonKey } from '../utils/supabase/info';

const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));

    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Bus API
export const busAPI = {
  getAll: () => fetchAPI('/buses'),
  getById: (id: string) => fetchAPI(`/buses/${id}`),
  create: (data: any) =>
    fetchAPI('/buses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchAPI('/buses', {
      method: 'POST',
      body: JSON.stringify({ id, ...data }),
    }),
  delete: (id: string) => fetchAPI(`/buses/${id}`, { method: 'DELETE' }),
  getAlert: (busId: string) => fetchAPI(`/buses/${busId}/alert`),
  setAlert: (busId: string, data: any) =>
    fetchAPI(`/buses/${busId}/alert`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  clearAlert: (busId: string) => fetchAPI(`/buses/${busId}/alert`, { method: 'DELETE' }),
  updateLocation: (busId: string, location: { lat: number; lng: number }) =>
    fetchAPI(`/buses/${busId}/location`, {
      method: 'PUT',
      body: JSON.stringify(location),
    }),
};

// Trip API
export const tripAPI = {
  getAll: () => fetchAPI('/trips'),
  getOngoing: () => fetchAPI('/trips/status/ongoing'),
  getById: (id: string) => fetchAPI(`/trips/${id}`),
  create: (data: any) =>
    fetchAPI('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchAPI(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  end: (id: string) => fetchAPI(`/trips/${id}/end`, { method: 'PUT' }),
};

// Passenger API
export const passengerAPI = {
  getByTrip: (tripId: string) => fetchAPI(`/trips/${tripId}/passengers`),
  add: (tripId: string, data: any) =>
    fetchAPI(`/trips/${tripId}/passengers`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  remove: (tripId: string, passengerId: string) =>
    fetchAPI(`/trips/${tripId}/passengers/${passengerId}`, { method: 'DELETE' }),
};

// Lost Items API
export const lostItemAPI = {
  getAll: () => fetchAPI('/lostitems'),
  create: (data: any) =>
    fetchAPI('/lostitems', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchAPI(`/lostitems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) => fetchAPI(`/lostitems/${id}`, { method: 'DELETE' }),
};

// Route API
export const routeAPI = {
  getAll: () => fetchAPI('/routes'),
  create: (data: any) =>
    fetchAPI('/routes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
