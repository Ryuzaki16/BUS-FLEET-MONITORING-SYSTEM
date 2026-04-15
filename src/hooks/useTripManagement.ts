import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { BusInfo, Passenger } from "../types/conductor";
import { passengerAPI, tripAPI } from "../utils/api";

export function useTripManagement(busInfo: BusInfo | null) {
  const [isActive, setIsActive] = useState(false);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);

  // 🔥 Better loading management (handles concurrency)
  const [loadingCount, setLoadingCount] = useState(0);
  const startLoading = () => setLoadingCount((c) => c + 1);
  const stopLoading = () => setLoadingCount((c) => Math.max(0, c - 1));
  const isLoading = useMemo(() => loadingCount > 0, [loadingCount]);

  const loadActiveTrip = useCallback(async (busId: string) => {
    startLoading();
    try {
      const response = await tripAPI.getOngoing();
      const activeTrip = response.data.find((trip: any) => trip.busId === busId);

      if (activeTrip) {
        setIsActive(true);
        setCurrentTripId(activeTrip.id);

        const passengersResponse = await passengerAPI.getByTrip(activeTrip.id);

        setPassengers(
          passengersResponse.data.map((p: any) => ({
            ...p,
            timestamp: new Date(p.timestamp),
          })),
        );

        toast.info("Active trip detected and loaded!");
      }
    } catch (error) {
      console.error("Error loading active trip:", error);
    } finally {
      stopLoading();
    }
  }, []);

  const startTrip = useCallback(async () => {
    if (!busInfo) {
      toast.error("No bus selected");
      return false;
    }

    startLoading();
    try {
      const tripId = `trip_${Date.now()}`;

      await tripAPI.create({
        id: tripId,
        busId: busInfo.id,
        busPlateNumber: busInfo.plateNumber,
        driver: busInfo.driver,
        route: busInfo.route,
      });

      setIsActive(true);
      setCurrentTripId(tripId);
      setPassengers([]);

      toast.success("Trip started successfully!");
      return true;
    } catch (error) {
      console.error("Error starting trip:", error);
      toast.error("Failed to start trip. Please try again.");
      return false;
    } finally {
      stopLoading();
    }
  }, [busInfo]);

  const endTrip = useCallback(async () => {
    if (!currentTripId) return false;

    startLoading();
    try {
      await tripAPI.end(currentTripId);

      setIsActive(false);
      setCurrentTripId(null);
      setPassengers([]);

      toast.success("Trip ended successfully!");
      return true;
    } catch (error) {
      console.error("Error ending trip:", error);
      toast.error("Failed to end trip. Please try again.");
      return false;
    } finally {
      stopLoading();
    }
  }, [currentTripId]);

  const addPassenger = useCallback(
    async (passenger: Omit<Passenger, "id" | "timestamp">) => {
      if (!currentTripId) {
        toast.error("No active trip. Please start a trip first.");
        return false;
      }

      startLoading();
      try {
        const passengerId = `TKT-${Date.now()}`;
        const newPassenger = {
          id: passengerId,
          ...passenger,
        };

        await passengerAPI.add(currentTripId, newPassenger);

        // ✅ Functional update (no stale state)
        setPassengers((prev) => [...prev, { ...newPassenger, timestamp: new Date() }]);

        toast.success("Ticket issued successfully!");
        return true;
      } catch (error) {
        console.error("Error issuing ticket:", error);
        toast.error("Failed to issue ticket. Please try again.");
        return false;
      } finally {
        stopLoading();
      }
    },
    [currentTripId],
  );

  const removePassenger = useCallback(
    async (passengerId: string) => {
      if (!currentTripId) return false;

      startLoading();
      try {
        await passengerAPI.remove(currentTripId, passengerId);

        // ✅ Functional update
        setPassengers((prev) => prev.filter((p) => p.id !== passengerId));

        toast.success("Passenger removed successfully!");
        return true;
      } catch (error) {
        console.error("Error removing passenger:", error);
        toast.error("Failed to remove passenger.");
        return false;
      } finally {
        stopLoading();
      }
    },
    [currentTripId],
  );

  const getTotalRevenue = useCallback(() => {
    return passengers.reduce((sum, p) => sum + p.fare, 0);
  }, [passengers]);

  return {
    isActive,
    currentTripId,
    passengers,
    isLoading,
    loadActiveTrip,
    startTrip,
    endTrip,
    addPassenger,
    removePassenger,
    getTotalRevenue,
  };
}
