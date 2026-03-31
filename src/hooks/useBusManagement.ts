import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { STORAGE_KEYS } from '../constants/conductor';
import { BusInfo, BusStatus } from '../types/conductor';
import { busAPI } from '../utils/api';

export function useBusSelection() {
  const [busInfo, setBusInfo] = useState<BusInfo | null>(null);
  const [busNumberInput, setBusNumberInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const validateBus = useCallback(async () => {
    if (!busNumberInput.trim()) {
      toast.error('Please enter a bus number');
      return null;
    }

    setIsValidating(true);
    try {
      const response = await busAPI.getAll();
      const buses = response.data || [];

      const foundBus = buses.find(
        (bus: any) =>
          bus.plateNumber.toLowerCase().replace(/\s+/g, '') === busNumberInput.toLowerCase().replace(/\s+/g, ''),
      );

      if (!foundBus) {
        toast.error('Bus not found! Please check the bus number or add it in Fleet Management first.');
        return null;
      }

      const busData: BusInfo = {
        id: foundBus.id,
        plateNumber: foundBus.plateNumber,
        route: foundBus.route,
        driver: foundBus.driver,
        capacity: foundBus.maxCapacity,
      };

      setBusInfo(busData);
      localStorage.setItem(STORAGE_KEYS.CONDUCTOR_BUS, JSON.stringify(busData));
      toast.success(`Bus ${foundBus.plateNumber} selected!`);

      return busData;
    } catch (error) {
      console.error('Error validating bus:', error);
      toast.error('Failed to validate bus. Please try again.');
      return null;
    } finally {
      setIsValidating(false);
    }
  }, [busNumberInput]);

  const loadSavedBus = useCallback(() => {
    const savedBus = localStorage.getItem(STORAGE_KEYS.CONDUCTOR_BUS);
    if (savedBus) {
      const bus = JSON.parse(savedBus);
      setBusInfo(bus);
      return bus;
    }
    return null;
  }, []);

  const clearBus = useCallback(() => {
    setBusInfo(null);
    setBusNumberInput('');
    localStorage.removeItem(STORAGE_KEYS.CONDUCTOR_BUS);
  }, []);

  return {
    busInfo,
    busNumberInput,
    isValidating,
    setBusNumberInput,
    validateBus,
    loadSavedBus,
    clearBus,
  };
}

export function useBusStatus(busInfo: BusInfo | null) {
  const [currentStatus, setCurrentStatus] = useState<BusStatus>('on-time');
  const [statusMessage, setStatusMessage] = useState('');

  const updateStatus = useCallback(
    async (status: BusStatus, message: string = '') => {
      if (!busInfo) return false;

      try {
        await busAPI.setAlert(busInfo.id, {
          status,
          message,
          plateNumber: busInfo.plateNumber,
          route: busInfo.route,
        });

        setCurrentStatus(status);
        setStatusMessage(message);
        toast.success('Status updated successfully!');
        return true;
      } catch (error) {
        console.error('Error updating status:', error);
        toast.error('Failed to update status.');
        return false;
      }
    },
    [busInfo],
  );

  return {
    currentStatus,
    statusMessage,
    updateStatus,
  };
}
