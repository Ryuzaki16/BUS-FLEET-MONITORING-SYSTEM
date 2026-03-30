import { useState, useCallback } from 'react';
import { QrCode, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BusQRCodeProps {
  busId: string;
  plateNumber: string;
  qrCodeId: string; // Permanent unique QR code identifier
}

export function BusQRCode({ busId, plateNumber, qrCodeId }: BusQRCodeProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Generate QR code URL using the permanent qrCodeId
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    `${window.location.origin}/bus/track/${busId}`
  )}`;

  const openModal = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      closeModal();
    }
  }, [closeModal]);

  const handleCloseClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  }, [closeModal]);

  const handleDownload = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `bus-${plateNumber}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [qrCodeUrl, plateNumber]);

  const handleContentClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  }, []);

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={openModal}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors duration-200 text-sm"
      >
        <QrCode className="w-4 h-4" />
        View QR Code
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: 'auto' }}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleBackdropClick}
            />

            {/* Modal Content Container */}
            <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto"
                onClick={handleContentClick}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div>
                    <h3 className="text-gray-900 mb-1">Bus QR Code</h3>
                    <p className="text-gray-600 text-sm">{plateNumber}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseClick}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors duration-150"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* QR Code Display */}
                <div className="p-6">
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-md mx-auto w-fit">
                      <img
                        src={qrCodeUrl}
                        alt={`QR Code for ${plateNumber}`}
                        className="w-64 h-64 block"
                        draggable={false}
                      />
                    </div>
                  </div>

                  {/* QR Code ID Display */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">QR Code ID:</span>
                      {/* <span className="text-gray-900 font-mono text-sm">{qrCodeUrl}</span> */}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <h4 className="text-gray-900 mb-2 flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-blue-600" />
                      How to use
                    </h4>
                    <ul className="text-gray-600 text-sm space-y-1.5">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Display this QR code on the bus windshield</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Passengers can scan to view real-time bus info</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Shows current location, capacity, and status</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>This QR code is permanent and unique to this bus</span>
                      </li>
                    </ul>
                  </div>

                  {/* Download Button */}
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download QR Code
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
