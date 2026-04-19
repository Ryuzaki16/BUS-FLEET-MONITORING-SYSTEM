import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { GPS_ERROR_CODES, STORAGE_KEYS } from "../constants/conductor";
import { Location } from "../types/conductor";
import { busAPI } from "../utils/api";

const INITIAL_GPS_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 60000,
  maximumAge: 0,
};

const WATCH_GPS_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 30000,
  maximumAge: 5000,
};

export function useGPSTracking(busId: string | null) {
  const [isGranted, setIsGranted] = useState(() => localStorage.getItem(STORAGE_KEYS.GPS_GRANTED) === "true");
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  const browserWatchIdRef = useRef<number | null>(null);
  const isAndroidNative = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";

  const updateBusLocation = useCallback(
    async (location: Location) => {
      if (!busId) return;

      try {
        await busAPI.updateLocation(busId, location);
      } catch (error) {
        console.error("Error updating bus location:", error);
      }
    },
    [busId],
  );

  const applyLocation = useCallback(
    (lat: number, lng: number, accuracy?: number | null) => {
      const location: Location = { lat, lng };

      // console.log("GPS position update:", {
      //   lat,
      //   lng,
      //   accuracy,
      //   platform: Capacitor.getPlatform(),
      // });

      setCurrentLocation(location);
      updateBusLocation(location);
    },
    [updateBusLocation],
  );

  const handleBrowserPositionUpdate = useCallback(
    (position: GeolocationPosition) => {
      applyLocation(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
    },
    [applyLocation],
  );

  const handlePositionError = useCallback((error: any) => {
    const code = error?.code;
    const message = error?.message ?? "Unknown error";

    console.error("GPS Error code:", code);
    console.error("GPS Error message:", message);
    console.error("GPS Error full:", error);

    // Capacitor plugin timeout / plugin-specific errors
    if (typeof code === "string") {
      if (code === "OS-PLUG-GLOC-0010") {
        toast.error(
          "Location is taking longer than expected on this device. Try moving outdoors and wait a little longer.",
        );
        return;
      }

      toast.error(`GPS error: ${message}`);
      return;
    }

    // Browser / WebView geolocation numeric errors
    switch (code) {
      case GPS_ERROR_CODES.PERMISSION_DENIED:
        toast.error("GPS permission denied. Please enable location services.");
        setIsGranted(false);
        localStorage.setItem(STORAGE_KEYS.GPS_GRANTED, "false");
        break;
      case GPS_ERROR_CODES.POSITION_UNAVAILABLE:
        toast.error("Location information unavailable.");
        break;
      case GPS_ERROR_CODES.TIMEOUT:
        toast.error("GPS request timed out. Try moving outdoors and wait a little longer.");
        break;
      default:
        toast.error(`GPS error: ${message}`);
    }
  }, []);

  const getCurrentPositionNative = useCallback(async () => {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
      maximumAge: 0,
    });

    applyLocation(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
  }, [applyLocation]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device");
      return;
    }

    if (browserWatchIdRef.current !== null) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      handleBrowserPositionUpdate,
      handlePositionError,
      WATCH_GPS_OPTIONS,
    );

    browserWatchIdRef.current = watchId;
    // console.log("GPS tracking started with watch ID:", watchId);
  }, [handleBrowserPositionUpdate, handlePositionError]);

  const stopTracking = useCallback(() => {
    if (browserWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(browserWatchIdRef.current);
      browserWatchIdRef.current = null;
      // console.log("GPS tracking stopped");
    }
  }, []);

  useEffect(() => {
    const initGps = async () => {
      const gpsGranted = localStorage.getItem(STORAGE_KEYS.GPS_GRANTED) === "true";

      if (isAndroidNative) {
        try {
          const permission = await Geolocation.checkPermissions();
          const granted = permission.location === "granted" || permission.coarseLocation === "granted";

          // console.log("Checked Android GPS permissions:", permission);

          setIsGranted(granted && gpsGranted);

          if (granted && gpsGranted && busId) {
            try {
              await getCurrentPositionNative();
            } catch (error) {
              handlePositionError(error);
            }

            startTracking();
          }

          return;
        } catch (error) {
          console.error("Failed to check Android GPS permissions:", error);
        }
      }

      // Browser/web fallback
      setIsGranted(gpsGranted);

      if (gpsGranted && busId) {
        startTracking();
      }
    };

    initGps();

    return () => {
      stopTracking();
    };
  }, [busId, startTracking, stopTracking, isAndroidNative, getCurrentPositionNative, handlePositionError]);

  const requestPermission = useCallback(async () => {
    setIsRequesting(true);

    try {
      if (isAndroidNative) {
        const permission = await Geolocation.requestPermissions();
        const granted = permission.location === "granted" || permission.coarseLocation === "granted";

        // console.log("Requested Android GPS permission:", permission);

        if (!granted) {
          toast.error("GPS permission denied. Please enable location services.");
          setIsGranted(false);
          localStorage.setItem(STORAGE_KEYS.GPS_GRANTED, "false");
          setIsRequesting(false);
          return false;
        }

        try {
          await getCurrentPositionNative();
          setIsGranted(true);
          localStorage.setItem(STORAGE_KEYS.GPS_GRANTED, "true");

          toast.success("GPS enabled successfully!");
          startTracking();
          setIsRequesting(false);
          return true;
        } catch (error) {
          handlePositionError(error);
          setIsRequesting(false);
          return false;
        }
      }

      // Browser/web path
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported on this device");
        setIsRequesting(false);
        return false;
      }

      return await new Promise<boolean>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            applyLocation(position.coords.latitude, position.coords.longitude, position.coords.accuracy);

            setIsGranted(true);
            localStorage.setItem(STORAGE_KEYS.GPS_GRANTED, "true");

            toast.success("GPS enabled successfully!");
            startTracking();
            setIsRequesting(false);
            resolve(true);
          },
          (error) => {
            handlePositionError(error);
            setIsRequesting(false);
            resolve(false);
          },
          INITIAL_GPS_OPTIONS,
        );
      });
    } catch (error) {
      console.error("GPS permission request error:", error);
      toast.error("Failed to request GPS permission.");
      setIsGranted(false);
      setIsRequesting(false);
      return false;
    }
  }, [handlePositionError, startTracking, isAndroidNative, getCurrentPositionNative, applyLocation]);

  const skipPermission = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.GPS_GRANTED, "skipped");
    toast.info("You can enable GPS tracking later");
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
