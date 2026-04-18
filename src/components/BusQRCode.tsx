import { Check, Copy, Download, Loader2, QrCode, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { getBusQrImageUrl } from "../utils/publicUrl";

interface BusQRCodeProps {
  busId: string;
  plateNumber: string;
  qrCodeId: string;
  publicBaseUrl?: string | null;
}

export function BusQRCode({ busId, plateNumber, qrCodeId, publicBaseUrl }: BusQRCodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isQrLoading, setIsQrLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const qrCodeUrl = useMemo(() => {
    if (!busId) return "";
    return getBusQrImageUrl(busId, publicBaseUrl);
  }, [busId, publicBaseUrl]);

  useEffect(() => {
    if (isOpen) {
      setIsQrLoading(true);
      setCopied(false);
    }
  }, [isOpen, qrCodeUrl]);

  const openModal = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setIsQrLoading(false);
    setIsDownloading(false);
    setIsCopying(false);
    setCopied(false);
  }, []);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (e.target === e.currentTarget) {
        closeModal();
      }
    },
    [closeModal],
  );

  const handleCloseClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      closeModal();
    },
    [closeModal],
  );

  const handleContentClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  }, []);

  const getQrBlob = useCallback(async () => {
    if (!qrCodeUrl) {
      throw new Error("QR code URL is not available");
    }

    const response = await fetch(qrCodeUrl, { mode: "cors" });

    if (!response.ok) {
      throw new Error("Failed to fetch QR code image");
    }

    return await response.blob();
  }, [qrCodeUrl]);

  const handleDownload = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (!qrCodeUrl || isQrLoading || isDownloading) return;

      try {
        setIsDownloading(true);

        const blob = await getQrBlob();
        const objectUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = `bus-${plateNumber.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(objectUrl);
        toast.success("QR code downloaded");
      } catch (error) {
        console.error("Error downloading QR code:", error);
        toast.error("Failed to download QR code");
      } finally {
        setIsDownloading(false);
      }
    },
    [getQrBlob, isDownloading, isQrLoading, plateNumber, qrCodeUrl],
  );

  const handleCopyImage = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (!qrCodeUrl || isQrLoading || isCopying) return;

      try {
        setIsCopying(true);

        if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
          throw new Error("Clipboard image copy is not supported in this browser");
        }

        const blob = await getQrBlob();
        const clipboardItem = new ClipboardItem({
          [blob.type || "image/png"]: blob,
        });

        await navigator.clipboard.write([clipboardItem]);

        setCopied(true);
        toast.success("QR code copied as image");

        window.setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (error) {
        console.error("Error copying QR image:", error);
        toast.error("Copy image is not supported on this device/browser");
      } finally {
        setIsCopying(false);
      }
    },
    [getQrBlob, isCopying, isQrLoading, qrCodeUrl],
  );

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: "auto" }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />

          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="max-w-sm w-full pointer-events-auto rounded-2xl bg-white shadow-2xl"
              onClick={handleContentClick}
            >
              <div className="flex items-center justify-between border-b border-gray-100 p-4">
                <div>
                  <h3 className="font-semibold leading-tight text-gray-900">Bus QR Code</h3>
                  <p className="text-sm text-gray-600">{plateNumber}</p>
                </div>

                <button
                  type="button"
                  onClick={handleCloseClick}
                  className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4">
                <div className="mb-4 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 p-4">
                  <div className="mx-auto w-fit rounded-xl bg-white p-3 shadow-sm">
                    <div className="relative flex h-44 w-44 items-center justify-center sm:h-52 sm:w-52">
                      {isQrLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-white">
                          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                          <span className="text-sm text-gray-600">Loading QR code...</span>
                        </div>
                      )}

                      <img
                        src={qrCodeUrl}
                        alt={`QR Code for ${plateNumber}`}
                        className={`block h-44 w-44 transition-opacity duration-200 sm:h-52 sm:w-52 ${
                          isQrLoading ? "opacity-0" : "opacity-100"
                        }`}
                        draggable={false}
                        onLoad={() => setIsQrLoading(false)}
                        onError={() => {
                          setIsQrLoading(false);
                          toast.error("Failed to load QR code");
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-600">QR Code ID:</span>
                    <span className="break-all text-right font-mono text-xs text-gray-900">{qrCodeId}</span>
                  </div>
                </div>

                <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
                    <QrCode className="w-4 h-4 text-blue-600" />
                    How to use
                  </h4>

                  <ul className="space-y-1.5 text-sm text-gray-600">
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

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={isQrLoading || isDownloading || isCopying}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 text-white transition-all duration-200 hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Download</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyImage}
                    disabled={isQrLoading || isDownloading || isCopying}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-gray-700 transition-all duration-200 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isCopying ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Copying...</span>
                      </>
                    ) : copied ? (
                      <>
                        <Check className="w-5 h-5 text-green-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        <span>Copy Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="w-full cursor-pointer rounded-lg bg-purple-50 px-3 py-2 text-sm text-purple-600 transition-colors duration-200 hover:bg-purple-100 flex items-center justify-center gap-2"
      >
        <QrCode className="w-4 h-4" />
        <span>View QR Code</span>
      </button>

      {mounted ? createPortal(modal, document.body) : null}
    </>
  );
}
