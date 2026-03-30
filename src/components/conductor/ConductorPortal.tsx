import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

// Hooks
import { useGPSTracking } from '../../hooks/useGPSTracking';
import { useTripManagement } from '../../hooks/useTripManagement';
import { useBusSelection, useBusStatus } from '../../hooks/useBusManagement';

// Components
import { BusSelectionScreen } from './BusSelectionScreen';
import { GPSPermissionModal } from './GPSPermissionModal';
import { TripCard } from './TripCard';
import { TripActions } from './TripActions';
import { PassengerList } from './PassengerList';
import { TicketFormModal, TicketFormData } from './TicketFormModal';
import { StatusUpdateModal } from './StatusUpdateModal';
import { LostItemFormModal } from './LostItemFormModal';

// Types
import { BusStatus, LostItem } from '../../types/conductor';
import { lostItemAPI } from '../../utils/api';

export function ConductorPortal() {
  // Bus Management
  const {
    busInfo,
    busNumberInput,
    isValidating,
    setBusNumberInput,
    validateBus,
    loadSavedBus,
    clearBus
  } = useBusSelection();

  // GPS Tracking
  const {
    isGranted: gpsGranted,
    currentLocation,
    isRequesting: isRequestingGps,
    requestPermission: requestGpsPermission,
    skipPermission: skipGps
  } = useGPSTracking(busInfo?.id || null);

  // Trip Management
  const {
    isActive: tripActive,
    passengers,
    isLoading,
    loadActiveTrip,
    startTrip,
    endTrip,
    addPassenger,
    removePassenger,
    getTotalRevenue
  } = useTripManagement(busInfo);

  // Bus Status
  const { currentStatus, updateStatus } = useBusStatus(busInfo);

  // UI State
  const [showGpsModal, setShowGpsModal] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showLostItemForm, setShowLostItemForm] = useState(false);
  const [busSelected, setBusSelected] = useState(false);

  // Load saved bus on mount
  useEffect(() => {
    const savedBus = loadSavedBus();
    if (savedBus) {
      setBusSelected(true);
      setShowGpsModal(!gpsGranted);
      loadActiveTrip(savedBus.id);
    }
  }, []);

  // Handlers
  const handleValidateBus = async () => {
    const bus = await validateBus();
    if (bus) {
      setBusSelected(true);
      setShowGpsModal(true);
      await loadActiveTrip(bus.id);
    }
  };

  const handleChangeBus = () => {
    if (tripActive) {
      toast.error('Please end the current trip before changing bus.');
      return;
    }
    clearBus();
    setBusSelected(false);
  };

  const handleIssueTicket = async (ticketData: TicketFormData) => {
    return await addPassenger(ticketData);
  };

  const handleUpdateStatus = async (status: BusStatus, message: string = '') => {
    const success = await updateStatus(status, message);
    if (success) {
      setShowStatusModal(false);
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

      toast.success('Lost item reported successfully!');
      return true;
    } catch (error) {
      console.error('Error reporting lost item:', error);
      toast.error('Failed to report lost item. Please try again.');
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

  // Render bus selection screen if no bus selected
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 md:mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900 mb-1 md:mb-2">Conductor Dashboard</h2>
              <p className="text-gray-600 text-sm md:text-base">
                Issue tickets and manage your trip
              </p>
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

        {/* Trip Card */}
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

        {/* Trip Content */}
        {tripActive ? (
          <>
            <TripActions
              passengerCount={passengers.length}
              totalRevenue={totalRevenue}
              onIssueTicket={() => setShowTicketForm(true)}
              onUpdateStatus={() => setShowStatusModal(true)}
              onReportLostItem={() => setShowLostItemForm(true)}
            />

            <PassengerList
              passengers={passengers}
              onRemovePassenger={removePassenger}
            />
          </>
        ) : (
          <NoActiveTripPlaceholder busPlateNumber={busInfo.plateNumber} />
        )}

        {/* Modals */}
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-8 sm:p-12 shadow-lg text-center"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400"
        >
          ⏱️
        </motion.div>
      </div>
      <h3 className="text-gray-900 mb-2">No Active Trip</h3>
      <p className="text-gray-600 text-sm sm:text-base mb-6">
        Click "Start Trip" to begin accepting passengers and issuing tickets.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
        <span>🚌</span>
        <span>Bus: {busPlateNumber}</span>
      </div>
    </motion.div>
  );
}