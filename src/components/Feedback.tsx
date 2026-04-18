import { useCallback, useEffect, useState } from "react";
import { Star, CheckCircle, AlertCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { feedbackAPI } from "../utils/api";
import { FeedbackItem } from "./FeedbackView";

const PAGE_SIZE = 3;

function StarRating({
  rating,
  setRating,
}: {
  rating: number;
  setRating?: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          onClick={() => setRating?.(star)}
          className={`h-6 w-6 transition ${setRating ? "cursor-pointer" : ""} ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300 hover:text-yellow-400"
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-500">{rating}/5</span>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 pt-2 pb-1">
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Page numbers */}
      {getPageNumbers().map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-1.5 text-gray-400 text-sm select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition ${
              p === currentPage
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Feedback() {
  const [searchParams] = useSearchParams();
  const busId = searchParams.get("busId") || "";

  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [driverRating, setDriverRating] = useState(0);
  const [conductorRating, setConductorRating] = useState(0);
  const [message, setMessage] = useState("");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(feedbackList.length / PAGE_SIZE);
  const paginatedFeedback = feedbackList.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const fetchFeedback = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await feedbackAPI.getByBus(id);
      setFeedbackList(result.data ?? []);
      setCurrentPage(1); // Reset to first page on fresh load
    } catch (err) {
      setError("Failed to load feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async () => {
    if (driverRating === 0 || conductorRating === 0) {
      setErrorMsg("Please rate both the driver and conductor.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      await feedbackAPI.submit({ busId, name, driverRating, conductorRating, message });
      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit feedback.");
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchFeedback(busId);
  }, []);

  useEffect(() => {
    if (status === "success") {
      fetchFeedback(busId);
    }
  }, [status]);

  const avgDriver =
    feedbackList.length > 0
      ? (feedbackList.reduce((sum, fb) => sum + fb.driverRating, 0) / feedbackList.length).toFixed(1)
      : "—";
  const avgConductor =
    feedbackList.length > 0
      ? (feedbackList.reduce((sum, fb) => sum + fb.conductorRating, 0) / feedbackList.length).toFixed(1)
      : "—";

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll the list back to top smoothly
    document.getElementById("feedback-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center flex-col justify-center p-6">
      <h2 className="text-base font-semibold text-gray-800">Ratings & Reviews</h2>
      <p className="text-xs text-gray-400 mt-0.5">Bus ID: {busId}</p>

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

      {/* Feedback list */}
      <div id="feedback-list" className="overflow-y-auto flex-1 px-6 py-4 space-y-4 w-full max-w-lg">
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
          paginatedFeedback.map((fb) => (
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

        {/* Pagination controls */}
        {!loading && !error && feedbackList.length > 0 && (
          <div className="space-y-1">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
            <p className="text-center text-xs text-gray-400">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, feedbackList.length)} of {feedbackList.length} reviews
            </p>
          </div>
        )}
      </div>

      {/* Submit form */}
      <div>
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Feedback</h1>
            <p className="text-gray-500 text-sm">
              Help us improve by sharing your experience
              {busId && (
                <span className="ml-1">
                  for <span className="font-medium text-indigo-600">Bus {busId}</span>
                </span>
              )}
              .
            </p>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-700">Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Anonymous"
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Driver Rating */}
            <div>
              <label className="text-sm font-medium text-gray-700">Driver Rating</label>
              <div className="mt-1">
                <StarRating rating={driverRating} setRating={setDriverRating} />
              </div>
            </div>

            {/* Conductor Rating */}
            <div>
              <label className="text-sm font-medium text-gray-700">Conductor Rating</label>
              <div className="mt-1">
                <StarRating rating={conductorRating} setRating={setConductorRating} />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-medium text-gray-700">Feedback Message (optional)</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your feedback..."
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Error */}
            {status === "error" && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={status === "loading"}
              className="w-full py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}