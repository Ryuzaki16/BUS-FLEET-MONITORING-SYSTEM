import { useCallback, useState } from "react";
import { toast } from "sonner";
import { BusInfo, Passenger } from "../types/conductor";
import { passengerAPI, tripAPI } from "../utils/api";

export function useTripManagement(busInfo: BusInfo | null) {
  const [isActive, setIsActive] = useState(false);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadActiveTrip = useCallback(async (busId: string) => {
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
    }
  }, []);

  const startTrip = useCallback(async () => {
    if (!busInfo) {
      toast.error("No bus selected");
      return false;
    }

    setIsLoading(true);
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
      setIsLoading(false);
    }
  }, [busInfo]);

  const endTrip = useCallback(async () => {
    if (!currentTripId) return false;

    setIsLoading(true);
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
      setIsLoading(false);
    }
  }, [currentTripId]);

  const addPassenger = useCallback(
    async (passenger: Omit<Passenger, "id" | "timestamp">) => {
      if (!currentTripId) {
        toast.error("No active trip. Please start a trip first.");
        return false;
      }

      setIsLoading(true);
      try {
        const passengerId = `TKT-${Date.now()}`;
        const newPassenger = {
          id: passengerId,
          ...passenger,
        };

        await passengerAPI.add(currentTripId, newPassenger);

        setPassengers([...passengers, { ...newPassenger, timestamp: new Date() }]);
        toast.success("Ticket issued successfully!");
        return true;
      } catch (error) {
        console.error("Error issuing ticket:", error);
        toast.error("Failed to issue ticket. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [currentTripId, passengers],
  );

  const removePassenger = useCallback(
    async (passengerId: string) => {
      if (!currentTripId) return false;

      setIsLoading(true);
      try {
        await passengerAPI.remove(currentTripId, passengerId);
        setPassengers(passengers.filter((p) => p.id !== passengerId));
        toast.success("Passenger removed successfully!");
        return true;
      } catch (error) {
        console.error("Error removing passenger:", error);
        toast.error("Failed to remove passenger.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [currentTripId, passengers],
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
