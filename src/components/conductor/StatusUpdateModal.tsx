import { AlertOctagon, CheckCircle, Clock, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { BusStatus } from '../../types/conductor';

interface StatusUpdateModalProps {
  isOpen: boolean;
  currentStatus: BusStatus;
  onClose: () => void;
  onUpdateStatus: (status: BusStatus, message?: string) => void;
}

export function StatusUpdateModal({ isOpen, currentStatus, onClose, onUpdateStatus }: StatusUpdateModalProps) {
  const statusOptions = [
    {
      status: 'on-time' as BusStatus,
      icon: <CheckCircle className="w-8 h-8 text-green-600" />,
      label: 'On Time',
      color: 'green',
    },
    {
      status: 'delayed' as BusStatus,
      icon: <Clock className="w-8 h-8 text-yellow-600" />,
      label: 'Delayed',
      color: 'yellow',
      message: 'Heavy traffic',
    },
    {
      status: 'stopped' as BusStatus,
      icon: <Info className="w-8 h-8 text-blue-600" />,
      label: 'Stopped',
      color: 'blue',
      message: 'Taking a break',
    },
    {
      status: 'emergency' as BusStatus,
      icon: <AlertOctagon className="w-8 h-8 text-red-600" />,
      label: 'Emergency',
      color: 'red',
      message: 'Emergency situation',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
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
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((option) => (
                <button
                  key={option.status}
                  onClick={() => onUpdateStatus(option.status, option.message)}
                  className={`p-4 border-2 border-${option.color}-200 rounded-xl hover:bg-${option.color}-50 transition-all flex flex-col items-center gap-2 ${
                    currentStatus === option.status ? `bg-${option.color}-50` : ''
                  }`}
                >
                  {option.icon}
                  <span className="text-sm font-medium text-gray-900">{option.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
