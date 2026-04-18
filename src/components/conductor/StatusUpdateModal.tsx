import { AlertOctagon, CheckCircle, Clock, Info, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { BusStatus } from "../../types/conductor";

interface StatusUpdateModalProps {
  isOpen: boolean;
  currentStatus: BusStatus;
  isUpdatingStatus: boolean;
  pendingStatus: BusStatus | null;
  onClose: () => void;
  onUpdateStatus: (status: BusStatus, message?: string) => void;
}

export function StatusUpdateModal({
  isOpen,
  currentStatus,
  isUpdatingStatus,
  pendingStatus,
  onClose,
  onUpdateStatus,
}: StatusUpdateModalProps) {
  const statusOptions: Array<{
    status: BusStatus;
    label: string;
    message?: string;
    icon: React.ReactNode;
    idleClasses: string;
    activeClasses: string;
    loadingIconClass: string;
  }> = [
    {
      status: "on-time",
      label: "On Time",
      icon: <CheckCircle className="w-8 h-8 text-green-600" />,
      idleClasses: "border-green-200 hover:bg-green-50",
      activeClasses: "bg-green-50 border-green-500 ring-2 ring-green-200",
      loadingIconClass: "text-green-600",
    },
    {
      status: "delayed",
      label: "Delayed",
      message: "Heavy traffic",
      icon: <Clock className="w-8 h-8 text-yellow-600" />,
      idleClasses: "border-yellow-200 hover:bg-yellow-50",
      activeClasses: "bg-yellow-50 border-yellow-500 ring-2 ring-yellow-200",
      loadingIconClass: "text-yellow-600",
    },
    {
      status: "stopped",
      label: "Stopped",
      message: "Taking a break",
      icon: <Info className="w-8 h-8 text-blue-600" />,
      idleClasses: "border-blue-200 hover:bg-blue-50",
      activeClasses: "bg-blue-50 border-blue-500 ring-2 ring-blue-200",
      loadingIconClass: "text-blue-600",
    },
    {
      status: "emergency",
      label: "Emergency",
      message: "Emergency situation",
      icon: <AlertOctagon className="w-8 h-8 text-red-600" />,
      idleClasses: "border-red-200 hover:bg-red-50",
      activeClasses: "bg-red-50 border-red-500 ring-2 ring-red-200",
      loadingIconClass: "text-red-600",
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
          onClick={() => !isUpdatingStatus && onClose()}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 text-lg sm:text-xl font-semibold">Update Bus Status</h3>
              <button
                onClick={() => !isUpdatingStatus && onClose()}
                disabled={isUpdatingStatus}
                className="cursor-pointer text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((option) => {
                const isPending = pendingStatus === option.status;
                const isCurrent = currentStatus === option.status && !isPending;

                return (
                  <button
                    key={option.status}
                    onClick={() => onUpdateStatus(option.status, option.message)}
                    disabled={isUpdatingStatus}
                    className={[
                      "min-h-[120px] p-4 border-2 rounded-xl transition-all flex flex-col items-center justify-center gap-2",
                      isPending
                        ? `${option.activeClasses} scale-[0.98]`
                        : isCurrent
                          ? option.activeClasses
                          : option.idleClasses,
                      isUpdatingStatus ? "opacity-70 cursor-not-allowed" : "cursor-pointer",
                    ].join(" ")}
                  >
                    {isPending ? (
                      <Loader2 className={`w-8 h-8 animate-spin ${option.loadingIconClass}`} />
                    ) : (
                      option.icon
                    )}

                    <span className="text-sm font-medium text-gray-900">
                      {isPending ? "Updating..." : option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
