import {
  AlertOctagon,
  AlertTriangle,
  Bus,
  CheckCircle,
  Clock,
  Info,
  Loader2,
  LogOut,
  MapPin,
  Navigation,
  Package,
  Plus,
  Search,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { busAPI, lostItemAPI, passengerAPI, tripAPI } from "../utils/api";

interface Passenger {
  id: string;
  ticketNumber: string;
  boardingPoint: string;
  destination: string;
  fare: number;
  timestamp: Date | string;
  paymentMethod: string;
}

interface BusInfo {
  id: string;
  plateNumber: string;
  route: string;
  driver: string;
  capacity: number;
}

export function ConductorPortalNew() {
  const [busSelected, setBusSelected] = useState(false);
  const [busInfo, setBusInfo] = useState<BusInfo | null>(null);
  const [busNumberInput, setBusNumberInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  // GPS State
  const [gpsPermissionGranted, setGpsPermissionGranted] = useState(false);
  const [showGpsModal, setShowGpsModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsWatchId, setGpsWatchId] = useState<number | null>(null);
  const [isRequestingGps, setIsRequestingGps] = useState(false);

  const [tripActive, setTripActive] = useState(false);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showLostItemForm, setShowLostItemForm] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<"on-time" | "delayed" | "emergency" | "stopped">("on-time");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Ticket form state
  const [boardingPoint, setBoardingPoint] = useState("Dasmariñas");
  const [destination, setDestination] = useState("Alabang");
  const [fare, setFare] = useState(45);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "digital">("cash");

  // Lost item form state
  const [lostItem, setLostItem] = useState({
    itemName: "",
    description: "",
    category: "other",
    location: "",
  });

  useEffect(() => {
    // Check if there's a saved bus session
    const savedBus = localStorage.getItem("conductor_bus");
    if (savedBus) {
      const bus = JSON.parse(savedBus);
      setBusInfo(bus);
      setBusSelected(true);

      // Check GPS permission status
      const gpsGranted = localStorage.getItem("conductor_gps_granted") === "true";
      setGpsPermissionGranted(gpsGranted);

      if (gpsGranted) {
        startGpsTracking();
      } else {
        setShowGpsModal(true);
      }

      loadActiveTrip(bus.id);
    }
  }, []);

  // Cleanup GPS tracking on unmount
  useEffect(() => {
    return () => {
      if (gpsWatchId !== null) {
        navigator.geolocation.clearWatch(gpsWatchId);
      }
    };
  }, [gpsWatchId]);

  const startGpsTracking = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setCurrentLocation(location);

        // Update backend with current location
        if (busInfo) {
          updateBusLocation(location);
        }
      },
      (error) => {
        console.error("GPS Error:", error);

        // GeolocationPositionError codes: PERMISSION_DENIED = 1, POSITION_UNAVAILABLE = 2, TIMEOUT = 3
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            toast.error("GPS permission denied. Please enable location services.");
            setGpsPermissionGranted(false);
            localStorage.setItem("conductor_gps_granted", "false");
            break;
          case 2: // POSITION_UNAVAILABLE
            toast.error("Location information unavailable.");
            break;
          case 3: // TIMEOUT
            toast.error("GPS request timed out.");
            break;
          default:
            toast.error(`GPS error: ${error.message || "Unknown error"}`);
        }
      },
      options,
    );

    setGpsWatchId(watchId);
    console.log("GPS tracking started with watch ID:", watchId);
  };

  const updateBusLocation = async (location: { lat: number; lng: number }) => {
    if (!busInfo) return;

    try {
      await busAPI.updateLocation(busInfo.id, location);
    } catch (error) {
      console.error("Error updating bus location:", error);
    }
  };

  const handleRequestGpsPermission = async () => {
    setIsRequestingGps(true);

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setIsRequestingGps(false);
      return;
    }

    try {
      // Request initial position to trigger permission
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setCurrentLocation(location);
          setGpsPermissionGranted(true);
          setShowGpsModal(false);
          localStorage.setItem("conductor_gps_granted", "true");

          toast.success("GPS enabled successfully!");

          // Start continuous tracking
          startGpsTracking();
          setIsRequestingGps(false);
        },
        (error) => {
          console.error("GPS Error:", error);

          // GeolocationPositionError codes: PERMISSION_DENIED = 1, POSITION_UNAVAILABLE = 2, TIMEOUT = 3
          if (error.code === 1) {
            toast.error("GPS permission denied. Please enable location in your browser settings.");
          } else if (error.code === 2) {
            toast.error("Location information is unavailable.");
          } else if (error.code === 3) {
            toast.error("GPS request timed out. Please try again.");
          } else {
            toast.error(`GPS error: ${error.message || "Failed to get your location"}`);
          }

          setIsRequestingGps(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    } catch (error) {
      console.error("Error requesting GPS permission:", error);
      toast.error("Failed to request GPS permission");
      setIsRequestingGps(false);
    }
  };

  const handleSkipGps = () => {
    setShowGpsModal(false);
    toast.info("You can enable GPS tracking later from settings");
  };

  const handleValidateBus = async () => {
    if (!busNumberInput.trim()) {
      toast.error("Please enter a bus number");
      return;
    }

    setIsValidating(true);
    try {
      const response = await busAPI.getAll();
      const buses = response.data || [];

      // Find bus by plate number (case-insensitive)
      const foundBus = buses.find(
        (bus: any) =>
          bus.plateNumber.toLowerCase().replace(/\s+/g, "") === busNumberInput.toLowerCase().replace(/\s+/g, ""),
      );

      if (!foundBus) {
        toast.error("Bus not found! Please check the bus number or add it in Fleet Management first.");
        setIsValidating(false);
        return;
      }

      // Set bus info
      const busData: BusInfo = {
        id: foundBus.id,
        plateNumber: foundBus.plateNumber,
        route: foundBus.route,
        driver: foundBus.driver,
        capacity: foundBus.maxCapacity,
      };

      setBusInfo(busData);
      setBusSelected(true);

      // Save to localStorage
      localStorage.setItem("conductor_bus", JSON.stringify(busData));

      toast.success(`Bus ${foundBus.plateNumber} selected!`);

      // Show GPS permission modal
      setShowGpsModal(true);

      // Check if there's an active trip for this bus
      await loadActiveTrip(foundBus.id);
    } catch (error) {
      console.error("Error validating bus:", error);
      toast.error("Failed to validate bus. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleChangeBus = () => {
    if (tripActive) {
      toast.error("Please end the current trip before changing bus.");
      return;
    }

    // Stop GPS tracking
    if (gpsWatchId !== null) {
      navigator.geolocation.clearWatch(gpsWatchId);
      setGpsWatchId(null);
    }

    setBusSelected(false);
    setBusInfo(null);
    setBusNumberInput("");
    setGpsPermissionGranted(false);
    setCurrentLocation(null);
    localStorage.removeItem("conductor_bus");
    localStorage.removeItem("conductor_gps_granted");
  };

  const loadActiveTrip = async (busId: string) => {
    try {
      const response = await tripAPI.getOngoing();
      const activeTrip = response.data.find((trip: any) => trip.busId === busId);

      if (activeTrip) {
        setTripActive(true);
        setCurrentTripId(activeTrip.id);

        // Load passengers for this trip
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
  };

  const handleStartTrip = async () => {
    if (!busInfo) {
      toast.error("No bus selected");
      return;
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

      setTripActive(true);
      setCurrentTripId(tripId);
      setPassengers([]);
      toast.success("Trip started successfully!");
    } catch (error) {
      console.error("Error starting trip:", error);
      toast.error("Failed to start trip. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndTrip = async () => {
    if (!currentTripId) return;

    setIsLoading(true);
    try {
      await tripAPI.end(currentTripId);
      setTripActive(false);
      setCurrentTripId(null);
      setPassengers([]);
      toast.success("Trip ended successfully!");
    } catch (error) {
      console.error("Error ending trip:", error);
      toast.error("Failed to end trip. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (status: "on-time" | "delayed" | "emergency" | "stopped", message: string = "") => {
    if (!busInfo) return;

    setCurrentStatus(status);
    setStatusMessage(message);
    setShowStatusModal(false);

    try {
      await busAPI.setAlert(busInfo.id, {
        status,
        message,
        plateNumber: busInfo.plateNumber,
        route: busInfo.route,
      });

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      toast.success("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status.");
    }
  };

  const commonRoutes = [
    { from: "Dasmariñas", to: "Alabang", fare: 45 },
    { from: "Dasmariñas", to: "Zapote", fare: 35 },
    { from: "Dasmariñas", to: "Sucat", fare: 40 },
    { from: "Zapote", to: "Alabang", fare: 25 },
    { from: "Sucat", to: "Alabang", fare: 15 },
  ];

  const issueTicket = async () => {
    if (!currentTripId) {
      toast.error("No active trip. Please start a trip first.");
      return;
    }

    setIsLoading(true);
    try {
      const passengerId = `TKT-${Date.now()}`;
      const newPassenger = {
        id: passengerId,
        ticketNumber: `${Math.floor(100000 + Math.random() * 900000)}`,
        boardingPoint,
        destination,
        fare,
        paymentMethod: "cash",
      };

      await passengerAPI.add(currentTripId, newPassenger);

      setPassengers([...passengers, { ...newPassenger, timestamp: new Date() }]);
      setShowTicketForm(false);

      // Reset form
      setBoardingPoint("Dasmariñas");
      setDestination("Alabang");
      setFare(45);

      toast.success("Ticket issued successfully!");
    } catch (error) {
      console.error("Error issuing ticket:", error);
      toast.error("Failed to issue ticket. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const removePassenger = async (id: string) => {
    if (!currentTripId) return;

    setIsLoading(true);
    try {
      await passengerAPI.remove(currentTripId, id);
      setPassengers(passengers.filter((p) => p.id !== id));
      toast.success("Passenger removed successfully!");
    } catch (error) {
      console.error("Error removing passenger:", error);
      toast.error("Failed to remove passenger.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportItem = async () => {
    if (!busInfo) return;

    setIsLoading(true);
    try {
      const itemId = `lf_${Date.now()}`;
      await lostItemAPI.create({
        id: itemId,
        ...lostItem,
        busPlateNumber: busInfo.plateNumber,
        route: busInfo.route,
        foundBy: busInfo.driver,
      });

      setShowLostItemForm(false);
      setShowSuccessToast(true);
      setLostItem({
        itemName: "",
        description: "",
        category: "other",
        location: "",
      });
      setTimeout(() => setShowSuccessToast(false), 3000);
      toast.success("Lost item reported successfully!");
    } catch (error) {
      console.error("Error reporting lost item:", error);
      toast.error("Failed to report lost item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // If no bus is selected, show bus selection screen
  if (!busSelected || !busInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-8 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <Bus className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h2 className="text-gray-900 mb-2 text-center">Conductor Portal</h2>
              <p className="text-gray-600 text-sm sm:text-base text-center">Enter your bus number to begin</p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">Bus Plate Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={busNumberInput}
                  onChange={(e) => setBusNumberInput(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === "Enter" && handleValidateBus()}
                  placeholder="e.g. ABC 1234"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none text-gray-900 text-lg font-semibold"
                  disabled={isValidating}
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <p className="text-gray-500 text-xs mt-2">Enter the bus number registered in Fleet Management</p>
            </div>

            <button
              onClick={handleValidateBus}
              disabled={isValidating || !busNumberInput.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isValidating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Verify Bus
                </>
              )}
            </button>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-blue-800 text-xs sm:text-sm">
                <strong>Note:</strong> The bus must be registered in the Fleet Management system by an administrator
                before you can start a trip.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const totalRevenue = passengers.reduce((sum, p) => sum + p.fare, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 md:mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900 mb-1 md:mb-2">Conductor Dashboard</h2>
              <p className="text-gray-600 text-sm md:text-base">Issue tickets and manage your trip</p>
            </div>
            <button
              onClick={handleChangeBus}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl flex items-center gap-2 transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Change Bus</span>
            </button>
          </div>
        </motion.div>

        {/* Trip Selection Card - Prioritized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-4 sm:p-6 md:p-8 mb-4 md:mb-6 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6 w-full sm:w-auto">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center flex-shrink-0">
                <Bus className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="mb-1 md:mb-2 text-white text-xl sm:text-2xl">{busInfo.plateNumber}</h3>
                <p className="text-indigo-100 text-sm sm:text-base md:text-lg truncate">{busInfo.route}</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-2 md:mt-3">
                  <div className="flex items-center gap-2 text-indigo-100 text-sm sm:text-base">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>
                      {passengers.length}/{busInfo.capacity} passengers
                    </span>
                  </div>
                  {tripActive && (
                    <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-white/20 rounded-full">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-white text-xs sm:text-sm">Trip Active</span>
                    </div>
                  )}
                  {gpsPermissionGranted && currentLocation && (
                    <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-green-500/20 rounded-full">
                      <Navigation className="w-3 h-3 sm:w-4 sm:h-4 text-green-300" />
                      <span className="text-green-100 text-xs sm:text-sm">GPS Active</span>
                    </div>
                  )}
                  {!gpsPermissionGranted && (
                    <button
                      onClick={() => setShowGpsModal(true)}
                      className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-yellow-500/20 rounded-full hover:bg-yellow-500/30 transition-colors"
                    >
                      <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
                      <span className="text-yellow-100 text-xs sm:text-sm">Enable GPS</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={tripActive ? handleEndTrip : handleStartTrip}
              disabled={isLoading}
              className={`cursor-pointer px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg w-full sm:w-auto disabled:opacity-50 ${
                tripActive
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-lg"
                  : "bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                  <span>{tripActive ? "Ending Trip..." : "Starting Trip..."}</span>
                </>
              ) : tripActive ? (
                <>
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>End Trip</span>
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>Start Trip</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {tripActive ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 md:mb-6">
              {/* Quick Issue Ticket Button - Highly Visible */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                onClick={() => setShowTicketForm(true)}
                className="col-span-1 sm:col-span-2 lg:col-span-2 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-5 sm:p-6 md:p-8 shadow-2xl hover:shadow-3xl transition-all active:scale-[0.98] sm:hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <Plus className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white text-lg sm:text-xl md:text-2xl mb-0.5 sm:mb-1">Issue New Ticket</h3>
                    <p className="text-green-100 text-sm sm:text-base md:text-lg">Tap to add a passenger</p>
                  </div>
                </div>
              </motion.button>

              {/* Trip Stats */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                </div>
                <div className="text-2xl sm:text-3xl text-gray-900 mb-1">{passengers.length}</div>
                <div className="text-gray-600 text-sm sm:text-base">Total Passengers</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <Ticket className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                </div>
                <div className="text-2xl sm:text-3xl text-gray-900 mb-1">₱{totalRevenue}</div>
                <div className="text-gray-600 text-sm sm:text-base">Total Revenue</div>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 md:mb-6">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => setShowStatusModal(true)}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all flex flex-col items-center gap-2 sm:gap-3"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-gray-900 text-sm sm:text-base font-medium text-center">Update Status</span>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={() => setShowLostItemForm(true)}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all flex flex-col items-center gap-2 sm:gap-3"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-gray-900 text-sm sm:text-base font-medium text-center">Report Lost Item</span>
              </motion.button>
            </div>

            {/* Passengers List */}
            {passengers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg"
              >
                <h3 className="text-gray-900 mb-4">Current Passengers</h3>
                <div className="space-y-3">
                  {passengers.map((passenger) => (
                    <div
                      key={passenger.id}
                      className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-900 font-medium text-sm sm:text-base">
                            #{passenger.ticketNumber}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {passenger.paymentMethod}
                          </span>
                        </div>
                        <div className="text-gray-600 text-xs sm:text-sm">
                          {passenger.boardingPoint} → {passenger.destination}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">₱{passenger.fare}</div>
                      </div>
                      <button
                        onClick={() => removePassenger(passenger.id)}
                        className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Ticket Form Modal */}
            <AnimatePresence>
              {showTicketForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={() => setShowTicketForm(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-gray-900">Issue New Ticket</h3>
                      <button onClick={() => setShowTicketForm(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Boarding Point</label>
                        <select
                          value={boardingPoint}
                          onChange={(e) => setBoardingPoint(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                        >
                          <option value="Dasmariñas">Dasmariñas</option>
                          <option value="Zapote">Zapote</option>
                          <option value="Sucat">Sucat</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Destination</label>
                        <select
                          value={destination}
                          onChange={(e) => {
                            setDestination(e.target.value);
                            // Auto-set fare based on route
                            const route = commonRoutes.find((r) => r.from === boardingPoint && r.to === e.target.value);
                            if (route) setFare(route.fare);
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                        >
                          <option value="Alabang">Alabang</option>
                          <option value="Sucat">Sucat</option>
                          <option value="Zapote">Zapote</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Fare</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                          <input
                            type="number"
                            value={fare}
                            onChange={(e) => setFare(Number(e.target.value))}
                            className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={issueTicket}
                      disabled={isLoading}
                      className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Issuing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Issue Ticket
                        </>
                      )}
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status Update Modal */}
            <AnimatePresence>
              {showStatusModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={() => setShowStatusModal(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-gray-900">Update Bus Status</h3>
                      <button onClick={() => setShowStatusModal(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <button
                        onClick={() => handleUpdateStatus("on-time")}
                        className="p-4 border-2 border-green-200 rounded-xl hover:bg-green-50 transition-all flex flex-col items-center gap-2"
                      >
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">On Time</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus("delayed", "Heavy traffic")}
                        className="p-4 border-2 border-yellow-200 rounded-xl hover:bg-yellow-50 transition-all flex flex-col items-center gap-2"
                      >
                        <Clock className="w-8 h-8 text-yellow-600" />
                        <span className="text-sm font-medium text-gray-900">Delayed</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus("stopped", "Taking a break")}
                        className="p-4 border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition-all flex flex-col items-center gap-2"
                      >
                        <Info className="w-8 h-8 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">Stopped</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus("emergency", "Emergency situation")}
                        className="p-4 border-2 border-red-200 rounded-xl hover:bg-red-50 transition-all flex flex-col items-center gap-2"
                      >
                        <AlertOctagon className="w-8 h-8 text-red-600" />
                        <span className="text-sm font-medium text-gray-900">Emergency</span>
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lost Item Form Modal */}
            <AnimatePresence>
              {showLostItemForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={() => setShowLostItemForm(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-gray-900">Report Lost Item</h3>
                      <button onClick={() => setShowLostItemForm(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Item Name</label>
                        <input
                          type="text"
                          value={lostItem.itemName}
                          onChange={(e) => setLostItem({ ...lostItem, itemName: e.target.value })}
                          placeholder="e.g. Black Backpack"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                        <textarea
                          value={lostItem.description}
                          onChange={(e) => setLostItem({ ...lostItem, description: e.target.value })}
                          placeholder="Detailed description of the item"
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                        <select
                          value={lostItem.category}
                          onChange={(e) => setLostItem({ ...lostItem, category: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                        >
                          <option value="electronics">Electronics</option>
                          <option value="bag">Bag</option>
                          <option value="clothing">Clothing</option>
                          <option value="documents">Documents</option>
                          <option value="accessories">Accessories</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Location Found</label>
                        <input
                          type="text"
                          value={lostItem.location}
                          onChange={(e) => setLostItem({ ...lostItem, location: e.target.value })}
                          placeholder="e.g. Under seat near back door"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleReportItem}
                      disabled={isLoading || !lostItem.itemName || !lostItem.description}
                      className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Reporting...
                        </>
                      ) : (
                        <>
                          <Package className="w-5 h-5" />
                          Report Item
                        </>
                      )}
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 sm:p-12 shadow-lg text-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <h3 className="text-gray-900 mb-2">No Active Trip</h3>
            <p className="text-gray-600 text-sm sm:text-base mb-6">
              Click "Start Trip" to begin accepting passengers and issuing tickets.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
              <Info className="w-4 h-4" />
              <span>Bus: {busInfo.plateNumber}</span>
            </div>
          </motion.div>
        )}

        {/* Success Toast */}
        <AnimatePresence>
          {showSuccessToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Action completed successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GPS Permission Modal */}
        <AnimatePresence>
          {showGpsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
              >
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                    <Navigation className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h3 className="text-gray-900 mb-2 text-center">Enable GPS Tracking</h3>
                  <p className="text-gray-600 text-sm sm:text-base text-center">
                    Allow real-time location tracking to provide accurate bus position updates to passengers and
                    administrators.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Why GPS is needed:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Real-time bus location updates</li>
                        <li>• Accurate arrival time estimates</li>
                        <li>• Enhanced passenger experience</li>
                        <li>• Route tracking and analytics</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {currentLocation && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium">GPS Active</p>
                      <p className="text-xs">
                        Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleSkipGps}
                    className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                  >
                    Skip for Now
                  </button>
                  <button
                    onClick={handleRequestGpsPermission}
                    disabled={isRequestingGps}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isRequestingGps ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Requesting...
                      </>
                    ) : (
                      <>
                        <Navigation className="w-5 h-5" />
                        Enable GPS
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                  You can change this setting later from your browser preferences
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
