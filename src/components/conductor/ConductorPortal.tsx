import { LogOut } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Hooks
import { useBusSelection, useBusStatus } from "../../hooks/useBusManagement";
import { useTripManagement } from "../../hooks/useTripManagement";

// Components
import { BusSelectionScreen } from "./BusSelectionScreen";
import { GPSPermissionModal } from "./GPSPermissionModal";
import { LostItemFormModal } from "./LostItemFormModal";
import { PassengerList } from "./PassengerList";
import { StatusUpdateModal } from "./StatusUpdateModal";
import { TicketFormData, TicketFormModal } from "./TicketFormModal";
import { TripActions } from "./TripActions";
import { TripCard } from "./TripCard";

// Types
import { STORAGE_KEYS } from "../../constants/conductor";
import { useGPSTracking } from "../../hooks/useGPSTracking";
import { BusPrinter } from "../../plugins/printer";
import { BusStatus, LostItem } from "../../types/conductor";
import { lostItemAPI } from "../../utils/api";

export function ConductorPortal() {
  const { busInfo, busNumberInput, isValidating, setBusNumberInput, validateBus, loadSavedBus, clearBus } =
    useBusSelection();

  const {
    isGranted: gpsGranted,
    currentLocation,
    isRequesting: isRequestingGps,
    requestPermission: requestGpsPermission,
    skipPermission: skipGps,
  } = useGPSTracking(busInfo?.id || null);

  const {
    isActive: tripActive,
    passengers,
    isLoading,
    loadActiveTrip,
    startTrip,
    endTrip,
    addPassenger,
    removePassenger,
    getTotalRevenue,
  } = useTripManagement(busInfo);

  const { currentStatus, updateStatus } = useBusStatus(busInfo);

  const [showGpsModal, setShowGpsModal] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showLostItemForm, setShowLostItemForm] = useState(false);
  const [busSelected, setBusSelected] = useState(false);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<BusStatus | null>(null);

  useEffect(() => {
    const savedBus = loadSavedBus();

    if (savedBus) {
      setBusSelected(true);
      const alreadyHandled = ["true", "skipped"].includes(localStorage.getItem(STORAGE_KEYS.GPS_GRANTED) ?? "");
      setShowGpsModal(!alreadyHandled);
      loadActiveTrip(savedBus.id);
    }
  }, []);

  const handleValidateBus = async () => {
    const bus = await validateBus();

    if (bus) {
      setBusSelected(true);
      setShowGpsModal(!gpsGranted);
      await loadActiveTrip(bus.id);
    }
  };

  const handleIssueTicket = async (ticketData: TicketFormData) => {
    const success = await addPassenger(ticketData);

    if (!success) return false;

    try {
      await BusPrinter.printReceipt({
        text: `
DASVAN DOTSCOOP
Ticket No: ${ticketData.ticketNumber}
Bus: ${busInfo?.plateNumber ?? "N/A"}
Route: ${busInfo?.route ?? "N/A"}
From: ${ticketData.boardingPoint}
To: ${ticketData.destination}
Fare: PHP ${ticketData.fare}
Payment: ${ticketData.paymentMethod}
        `.trim(),
      });
    } catch (error) {
      console.error("Print failed:", error);
      toast.error("Ticket issued, but printing failed.");
    }

    return true;
  };

  const handleChangeBus = () => {
    if (tripActive) {
      toast.error("Please end the current trip before changing bus.");
      return;
    }

    clearBus();
    setBusSelected(false);
  };

  const handleUpdateStatus = async (status: BusStatus, message: string = "") => {
    if (isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    setPendingStatus(status);

    // Give React one frame to render the loading state first
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });

    const startedAt = Date.now();

    try {
      const success = await updateStatus(status, message);

      const elapsed = Date.now() - startedAt;
      const minimumVisibleMs = 500;

      if (elapsed < minimumVisibleMs) {
        await new Promise((resolve) => setTimeout(resolve, minimumVisibleMs - elapsed));
      }

      if (success) {
        setShowStatusModal(false);
      }
    } finally {
      setIsUpdatingStatus(false);
      setPendingStatus(null);
    }
  };

  const handleReportLostItem = async (item: LostItem) => {
    if (!busInfo) return false;

    try {
      const itemId = `lf_${Date.now()}`;

      await lostItemAPI.create({
        id: itemId,
        ...item,
        busPlateNumber: busInfo.plateNumber,
        route: busInfo.route,
        foundBy: busInfo.driver,
      });

      toast.success("Lost item reported successfully!");
      return true;
    } catch (error) {
      console.error("Error reporting lost item:", error);
      toast.error("Failed to report lost item. Please try again.");
      return false;
    }
  };

  const handleGpsRequest = async () => {
    const granted = await requestGpsPermission();
    if (granted) {
      setShowGpsModal(false);
    }
  };

  const handleGpsSkip = () => {
    skipGps();
    setShowGpsModal(false);
  };

  if (!busSelected || !busInfo) {
    return (
      <BusSelectionScreen
        busNumberInput={busNumberInput}
        isValidating={isValidating}
        onBusNumberChange={setBusNumberInput}
        onValidate={handleValidateBus}
      />
    );
  }

  const totalRevenue = getTotalRevenue();

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="mx-auto w-full max-w-7xl px-2.5 py-2.5 sm:px-4 sm:py-4 md:px-6 md:py-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mb-3 md:mb-5"
        >
          <div className="flex flex-col gap-2 rounded-2xl bg-white/85 backdrop-blur-sm border border-white/70 shadow-sm p-3 sm:p-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Conductor Dashboard</h2>
              <p className="mt-0.5 text-xs sm:text-sm md:text-base text-gray-600">Issue tickets and manage your trip</p>
            </div>

            <button
              disabled={isLoading}
              onClick={handleChangeBus}
              className="cursor-pointer inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gray-100 px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <LogOut className="h-4 w-4" />
              <span>Change Bus</span>
            </button>
          </div>
        </motion.div>

        <div className="space-y-3 md:space-y-5">
          <TripCard
            busInfo={busInfo}
            isActive={tripActive}
            passengerCount={passengers.length}
            isLoading={isLoading}
            gpsGranted={gpsGranted}
            currentLocation={currentLocation}
            onStartTrip={startTrip}
            onEndTrip={endTrip}
            onEnableGPS={() => setShowGpsModal(true)}
          />

          {tripActive ? (
            <>
              <TripActions
                passengerCount={passengers.length}
                totalRevenue={totalRevenue}
                onIssueTicket={() => setShowTicketForm(true)}
                onUpdateStatus={() => setShowStatusModal(true)}
                onReportLostItem={() => setShowLostItemForm(true)}
              />

              <PassengerList passengers={passengers} onRemovePassenger={removePassenger} />
            </>
          ) : (
            <NoActiveTripPlaceholder busPlateNumber={busInfo.plateNumber} />
          )}
        </div>

        <GPSPermissionModal
          isOpen={showGpsModal}
          currentLocation={currentLocation}
          isRequesting={isRequestingGps}
          onRequestPermission={handleGpsRequest}
          onSkip={handleGpsSkip}
        />

        <TicketFormModal
          isOpen={showTicketForm}
          isLoading={isLoading}
          onClose={() => setShowTicketForm(false)}
          onIssueTicket={handleIssueTicket}
        />

        <StatusUpdateModal
          isOpen={showStatusModal}
          currentStatus={currentStatus}
          isUpdatingStatus={isUpdatingStatus}
          pendingStatus={pendingStatus}
          onClose={() => setShowStatusModal(false)}
          onUpdateStatus={handleUpdateStatus}
        />

        <LostItemFormModal
          isOpen={showLostItemForm}
          isLoading={isLoading}
          onClose={() => setShowLostItemForm(false)}
          onReportItem={handleReportLostItem}
        />
      </div>
    </div>
  );
}

interface NoActiveTripPlaceholderProps {
  busPlateNumber: string;
}

function NoActiveTripPlaceholder({ busPlateNumber }: NoActiveTripPlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="rounded-2xl bg-white p-5 sm:p-7 md:p-9 shadow-lg border border-gray-100 text-center"
    >
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 sm:h-18 sm:w-18 md:h-20 md:w-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-2xl sm:text-3xl md:text-4xl"
        >
          ⏱️
        </motion.div>
      </div>

      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">No Active Trip</h3>

      <p className="mx-auto mb-5 max-w-md text-sm sm:text-base text-gray-600 leading-relaxed">
        Click “Start Trip” to begin accepting passengers and issuing tickets.
      </p>

      <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">
        <span>🚌</span>
        <span className="break-all sm:break-normal">Bus: {busPlateNumber}</span>
      </div>
    </motion.div>
  );
}
