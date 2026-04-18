import { useState, useCallback, useEffect } from "react";
import { feedbackAPI } from "../utils/api";

export interface FeedbackViewProps {
  busID: string;
  setBusID: (id: string) => void;
}

export interface FeedbackItem {
  id: string;
  busId: string;
  name?: string;
  driverRating: number;
  conductorRating: number;
  message?: string;
  createdAt?: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-sm text-gray-500">{rating}/5</span>
    </div>
  );
}

export function FeedbackView({ busID, setBusID }: FeedbackViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await feedbackAPI.getByBus(id);
      setFeedbackList(result.data ?? []);
    } catch (err) {
      setError("Failed to load feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const openModal = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(true);
      setBusID(busID);
      fetchFeedback(busID);
    },
    [busID, setBusID, fetchFeedback]
  );

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setBusID("");
    setFeedbackList([]);
    setError(null);
  }, [setBusID]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeModal]);

  const avgDriver =
    feedbackList.length > 0
      ? (feedbackList.reduce((sum, f) => sum + f.driverRating, 0) / feedbackList.length).toFixed(1)
      : null;

  const avgConductor =
    feedbackList.length > 0
      ? (feedbackList.reduce((sum, f) => sum + f.conductorRating, 0) / feedbackList.length).toFixed(1)
      : null;

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="cursor-pointer w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors duration-200 text-sm"
      >
        <span>View Ratings and Reviews</span>
      </button>

      {isOpen && (
        // Backdrop
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={closeModal}
        >
          {/* Modal panel — stop click from closing */}
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-800">Ratings & Reviews</h2>
                <p className="text-xs text-gray-400 mt-0.5">Bus ID: {busID}</p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Summary averages */}
            {!loading && !error && feedbackList.length > 0 && (
              <div className="flex gap-4 px-6 py-3 bg-purple-50 border-b border-purple-100">
                <div className="flex-1 text-center">
                  <p className="text-sm mb-0.5">Avg. Driver</p>
                  <p className="text-xl font-semibold text-purple-700">{avgDriver}</p>
                  <p className="text-sm">out of 5</p>
                </div>
                <div className="w-px bg-purple-200" />
                <div className="flex-1 text-center">
                  <p className="text-sm mb-0.5">Avg. Conductor</p>
                  <p className="text-xl font-semibold text-purple-700">{avgConductor}</p>
                  <p className="text-sm">out of 5</p>
                </div>
                <div className="w-px bg-purple-200" />
                <div className="flex-1 text-center">
                  <p className="text-sm mb-0.5">Total Reviews</p>
                  <p className="text-xl font-semibold">{feedbackList.length}</p>
                  <p className="text-sm">reviews</p>
                </div>
              </div>
            )}

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              {loading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-8 h-8 border-2 border-gray-700 rounded-full animate-spin" />
                  <p className="text-sm text-gray-400">Loading feedback...</p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl text-red-600 text-sm">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {!loading && !error && feedbackList.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-sm text-gray-400">No reviews yet for this bus.</p>
                </div>
              )}

              {!loading &&
                !error &&
                feedbackList.map((fb) => (
                  <div key={fb.id} className="border border-gray-500 rounded-xl p-4 space-y-3">
                    {/* Reviewer info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm">
                          {fb.name ? fb.name.charAt(0).toUpperCase() : "A"}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {fb.name ?? "Anonymous"}
                        </span>
                      </div>
                      {fb.createdAt && (
                        <span className="text-xs text-gray-400">
                          {new Date(fb.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Ratings */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700 w-20">Driver</span>
                        <StarRating rating={fb.driverRating} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700 w-20">Conductor</span>
                        <StarRating rating={fb.conductorRating} />
                      </div>
                    </div>

                    {/* Message */}
                    {fb.message && (
                      <p className="text-sm text-gray-700 bg-gray-200 rounded-lg px-3 py-2">
                        message: {fb.message}
                      </p>
                    )}
                  </div>
                ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100">
              <button
                onClick={closeModal}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}