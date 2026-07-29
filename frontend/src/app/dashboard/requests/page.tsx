"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getReceivedRequests, getSentRequests, respondToSwapRequest } from "@/api/requests";
import { submitReview } from "@/api/reviews";
import { Star } from "lucide-react";
import Link from "next/link";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string;
}

interface SwapRequest {
  _id: string;
  senderId: User;
  receiverId: User;
  skillOffered: string;
  skillWanted: string;
  message?: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  createdAt: string;
}

export default function RequestsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [receivedRequests, setReceivedRequests] = useState<SwapRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<SwapRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewModal, setReviewModal] = useState<{ swapRequestId: string; partnerName: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      setError("");
      const [receivedData, sentData] = await Promise.all([
        getReceivedRequests(),
        getSentRequests()
      ]);
      setReceivedRequests(receivedData.data.requests);
      setSentRequests(sentData.data.requests);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const handleRespond = async (id: string, status: "accepted" | "declined" | "cancelled" | "completed", partnerName?: string) => {
    try {
      await respondToSwapRequest(id, status);
      if (status === "completed" && partnerName) {
        setReviewModal({ swapRequestId: id, partnerName });
        setReviewRating(5);
        setReviewComment("");
      }
      fetchRequests(); // Refresh the lists
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${status} request`);
      setTimeout(() => setError(""), 4000);
    }
  };

  const handleSubmitReview = async (skip: boolean) => {
    if (!reviewModal) return;
    if (!skip) {
      try {
        setReviewSubmitting(true);
        await submitReview({ swapRequestId: reviewModal.swapRequestId, rating: reviewRating, comment: reviewComment });
      } catch (error) {
        console.error("Failed to submit review", error);
      } finally {
        setReviewSubmitting(false);
      }
    }
    setReviewModal(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">Pending</span>;
      case "accepted":
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">In Progress</span>;
      case "completed":
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Completed</span>;
      case "declined":
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">Declined</span>;
      case "cancelled":
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">Cancelled</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#2A367E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-[#0D1236] mb-1">Rate this Swap Partnership</h2>
            <p className="text-sm text-gray-500 mb-4">How was your overall skill swap with {reviewModal.partnerName}?</p>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setReviewRating(star)}>
                  <Star size={28} className={star <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Leave a comment (optional)"
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => handleSubmitReview(true)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition">Skip</button>
              <button
                onClick={() => handleSubmitReview(false)}
                disabled={reviewSubmitting}
                className="px-4 py-2 bg-[#2A367E] text-white text-sm rounded-lg hover:bg-[#1a2253] transition disabled:opacity-50"
              >
                {reviewSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-[#0D1236]">Swap Requests</h1>
        <p className="text-gray-500 mt-1">Manage your skill exchange proposals.</p>
      </div>

      <div className="flex space-x-4 border-b border-gray-200">
        <button
          className={`pb-2 px-1 ${activeTab === "received" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("received")}
        >
          Received ({receivedRequests.length})
        </button>
        <button
          className={`pb-2 px-1 ${activeTab === "sent" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("sent")}
        >
          Sent ({sentRequests.length})
        </button>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      <div className="space-y-4">
        {activeTab === "received" && (
          receivedRequests.length === 0 ? (
            <div className="bg-white p-8 rounded-xl text-center shadow-sm border border-gray-100">
              <p className="text-gray-500">You don't have any received swap requests.</p>
            </div>
          ) : (
            receivedRequests.map((req) => (
              <div key={req._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                    {req.senderId.imageUrl ? (
                      <img src={`${req.senderId.imageUrl}`} alt={req.senderId.firstName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-blue-600 font-bold text-xl">{req.senderId.firstName[0]}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{req.senderId.firstName} {req.senderId.lastName}</h3>
                    <p className="text-sm text-gray-500">
                      Wants to learn <span className="font-medium text-gray-700">{req.skillWanted}</span> in exchange for <span className="font-medium text-gray-700">{req.skillOffered}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:items-end space-y-2">
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(req.status)}
                    <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                  {req.status === "pending" && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRespond(req._id, "accepted")}
                        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespond(req._id, "declined")}
                        className="px-4 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                  {req.status === "accepted" && (
                    <button
                      onClick={() => handleRespond(req._id, "completed", `${req.senderId.firstName} ${req.senderId.lastName}`)}
                      className="px-4 py-1.5 bg-green-50 text-green-700 text-sm rounded-lg hover:bg-green-100 transition border border-green-200"
                    >
                      End Partnership
                    </button>
                  )}
                </div>
              </div>
            ))
          )
        )}

        {activeTab === "sent" && (
          sentRequests.length === 0 ? (
            <div className="bg-white p-8 rounded-xl text-center shadow-sm border border-gray-100">
              <p className="text-gray-500">You haven't sent any swap requests yet.</p>
            </div>
          ) : (
            sentRequests.map((req) => (
              <div key={req._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                    {req.receiverId.imageUrl ? (
                      <img src={`${req.receiverId.imageUrl}`} alt={req.receiverId.firstName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-purple-600 font-bold text-xl">{req.receiverId.firstName[0]}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">To: {req.receiverId.firstName} {req.receiverId.lastName}</h3>
                    <p className="text-sm text-gray-500">
                      You offered <span className="font-medium text-gray-700">{req.skillOffered}</span> in exchange for <span className="font-medium text-gray-700">{req.skillWanted}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:items-end space-y-2">
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(req.status)}
                    <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                  {req.status === "pending" && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRespond(req._id, "cancelled")}
                        className="px-4 py-1.5 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 transition"
                      >
                        Cancel Request
                      </button>
                    </div>
                  )}
                  {req.status === "accepted" && (
                    <button
                      onClick={() => handleRespond(req._id, "completed", `${req.receiverId.firstName} ${req.receiverId.lastName}`)}
                      className="px-4 py-1.5 bg-green-50 text-green-700 text-sm rounded-lg hover:bg-green-100 transition border border-green-200"
                    >
                      End Partnership
                    </button>
                  )}
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
