import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { GPS_ERROR_CODES, GPS_OPTIONS, STORAGE_KEYS } from '../constants/conductor';
import { Location } from '../types/conductor';
import { busAPI } from '../utils/api';

export function useGPSTracking(busId: string | null) {
  const [isGranted, setIsGranted] = useState(() => localStorage.getItem(STORAGE_KEYS.GPS_GRANTED) === 'true');

  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  // Check saved permission on mount
  useEffect(() => {
    const gpsGranted = localStorage.getItem(STORAGE_KEYS.GPS_GRANTED) === 'true';
    setIsGranted(gpsGranted);

    if (gpsGranted && busId) {
      startTracking();
    }

    return () => {
      stopTracking();
    };
  }, [busId]);

  const updateBusLocation = useCallback(
    async (location: Location) => {
      if (!busId) return;

      try {
        await busAPI.updateLocation(busId, location);
        console.log('Bus location updated:', location);
      } catch (error) {
        console.error('Error updating bus location:', error);
      }
    },
    [busId],
  );

  const handlePositionUpdate = useCallback(
    (position: GeolocationPosition) => {
      const location: Location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      setCurrentLocation(location);
      updateBusLocation(location);
    },
    [updateBusLocation],
  );

  const handlePositionError = useCallback((error: GeolocationPositionError) => {
    console.error('GPS Error:', error);

    switch (error.code) {
      case GPS_ERROR_CODES.PERMISSION_DENIED:
        toast.error('GPS permission denied. Please enable location services.');
        setIsGranted(false);
        localStorage.setItem(STORAGE_KEYS.GPS_GRANTED, 'false');
        break;
      case GPS_ERROR_CODES.POSITION_UNAVAILABLE:
        toast.error('Location information unavailable.');
        break;
      case GPS_ERROR_CODES.TIMEOUT:
        toast.error('GPS request timed out.');
        break;
      default:
        toast.error(`GPS error: ${error.message || 'Unknown error'}`);
    }
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    if (watchIdRef.current !== null) {
      return; // Already tracking
    }

    const watchId = navigator.geolocation.watchPosition(handlePositionUpdate, handlePositionError, GPS_OPTIONS);

    watchIdRef.current = watchId;
    console.log('GPS tracking started with watch ID:', watchId);
  }, [handlePositionUpdate, handlePositionError]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      console.log('GPS tracking stopped');
    }
  }, []);

  const requestPermission = useCallback(async () => {
    setIsRequesting(true);

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setIsRequesting(false);
      return false;
    }

    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setCurrentLocation(location);
          setIsGranted(true);
          localStorage.setItem(STORAGE_KEYS.GPS_GRANTED, 'true');

          toast.success('GPS enabled successfully!');
          startTracking();
          setIsRequesting(false);
          resolve(true);
        },
        (error) => {
          handlePositionError(error);
          setIsRequesting(false);
          resolve(false);
        },
        GPS_OPTIONS,
      );
    });
  }, [startTracking, handlePositionError]);

  const skipPermission = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.GPS_GRANTED, 'skipped');
    toast.info('You can enable GPS tracking later');
  }, []);

  return {
    isGranted,
    currentLocation,
    isRequesting,
    requestPermission,
    skipPermission,
    startTracking,
    stopTracking,
  };
}
