import { Download, Loader2, QrCode, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

interface BusQRCodeProps {
  busId: string
  plateNumber: string
  qrCodeId: string
}

export function BusQRCode({ busId, plateNumber, qrCodeId }: BusQRCodeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isQrLoading, setIsQrLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  const qrCodeUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''

    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      `${window.location.origin}/bus/track/${busId}`,
    )}`
  }, [qrCodeId])

  useEffect(() => {
    if (isOpen) {
      setIsQrLoading(true)
    }
  }, [isOpen, qrCodeUrl])

  const openModal = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    setIsQrLoading(false)
  }, [])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation()
      if (e.target === e.currentTarget) {
        closeModal()
      }
    },
    [closeModal],
  )

  const handleCloseClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      closeModal()
    },
    [closeModal],
  )

  const handleDownload = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()

      if (!qrCodeUrl || isQrLoading) return

      const link = document.createElement('a')
      link.href = qrCodeUrl
      link.download = `bus-${plateNumber}-qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    [qrCodeUrl, plateNumber, isQrLoading],
  )

  const handleContentClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }, [])

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: 'auto' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />

          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full pointer-events-auto"
              onClick={handleContentClick}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div>
                  <h3 className="text-gray-900 font-semibold leading-tight">Bus QR Code</h3>
                  <p className="text-gray-600 text-sm">{plateNumber}</p>
                </div>

                <button
                  type="button"
                  onClick={handleCloseClick}
                  className="cursor-pointer text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors duration-150"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 mb-4">
                  <div className="bg-white rounded-xl shadow-sm mx-auto w-fit p-3">
                    <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
                      {isQrLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white rounded-lg">
                          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                          <span className="text-sm text-gray-600">Loading QR code...</span>
                        </div>
                      )}

                      <img
                        src={qrCodeUrl}
                        alt={`QR Code for ${plateNumber}`}
                        className={`block w-44 h-44 sm:w-52 sm:h-52 transition-opacity duration-200 ${
                          isQrLoading ? 'opacity-0' : 'opacity-100'
                        }`}
                        draggable={false}
                        onLoad={() => setIsQrLoading(false)}
                        onError={() => setIsQrLoading(false)}
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600 text-sm">QR Code ID:</span>
                    <span className="text-gray-900 font-mono text-xs break-all text-right">{qrCodeId}</span>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                  <h4 className="text-gray-900 mb-2 flex items-center gap-2 text-sm font-medium">
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

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isQrLoading}
                  className="cursor-pointer w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isQrLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Download QR Code</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="cursor-pointer w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors duration-200 text-sm"
      >
        <QrCode className="w-4 h-4" />
        <span>View QR Code</span>
      </button>

      {mounted ? createPortal(modal, document.body) : null}
    </>
  )
}
