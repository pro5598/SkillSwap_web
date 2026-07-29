"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getReceivedRequests, getSentRequests, respondToSwapRequest } from "@/api/requests";
import { submitReview, hasReviewed } from "@/api/reviews";
import { CheckCircle, History, MessageSquare, ArrowRightLeft, User as UserIcon, Star } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

type SwapRequest = {
  _id: string;
  senderId: { _id: string; firstName: string; lastName: string; imageUrl?: string };
  receiverId: { _id: string; firstName: string; lastName: string; imageUrl?: string };
  skillOffered: string;
  skillWanted: string;
  message?: string;
  status: "pending" | "accepted" | "declined" | "cancelled" | "completed";
  createdAt: string;
  updatedAt: string;
};

export default function SwapsPage() {
  const { user } = useAuth();
  const [activeSwaps, setActiveSwaps] = useState<SwapRequest[]>([]);
  const [completedSwaps, setCompletedSwaps] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<{ swapRequestId: string; partnerName: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewedMap, setReviewedMap] = useState<Record<string, boolean>>({});

  const checkReviewStatus = async (completed: SwapRequest[]) => {
    const results: Record<string, boolean> = {};
    await Promise.all(
      completed.map(async (swap) => {
        try {
          const res = await hasReviewed(swap._id);
          results[swap._id] = res.data?.reviewed ?? false;
        } catch {
          results[swap._id] = false;
        }
      })
    );
    setReviewedMap(results);
  };

  const fetchSwaps = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const [receivedRes, sentRes] = await Promise.all([
        getReceivedRequests(),
        getSentRequests(),
      ]);

      const allRequests = [
        ...(receivedRes.data.requests || []),
        ...(sentRes.data.requests || []),
      ];

      // Remove duplicates just in case (though sent and received should be mutually exclusive)
      const uniqueRequests = Array.from(new Map(allRequests.map(r => [r._id, r])).values()) as SwapRequest[];

      const active = uniqueRequests.filter((r) => r.status === "accepted");
      const completed = uniqueRequests.filter((r) => r.status === "completed");

      // Sort by updatedAt descending
      active.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      completed.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      setActiveSwaps(active);
      setCompletedSwaps(completed);
      await checkReviewStatus(completed);
    } catch (error) {
      console.error("Failed to fetch swaps", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSwaps();
    }
  }, [user]);

  const openReviewModal = (swapId: string, partnerName: string) => {
    setReviewModal({ swapRequestId: swapId, partnerName });
    setReviewRating(5);
    setReviewComment("");
  };

  const handleCompleteSwap = async (swapId: string, partnerName: string) => {
    try {
      setActionLoading(swapId);
      await respondToSwapRequest(swapId, "completed");
      openReviewModal(swapId, partnerName);
      setActiveTab("completed");
      fetchSwaps(false);
    } catch (error) {
      console.error("Failed to complete swap", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitReview = async (skip: boolean) => {
    if (!reviewModal) return;
    if (!skip) {
      try {
        setReviewSubmitting(true);
        await submitReview({
          swapRequestId: reviewModal.swapRequestId,
          rating: reviewRating,
          comment: reviewComment,
        });
        setReviewedMap((prev) => ({ ...prev, [reviewModal.swapRequestId]: true }));
      } catch (error) {
        console.error("Failed to submit review", error);
      } finally {
        setReviewSubmitting(false);
      }
    }
    setReviewModal(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#2A367E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Loading swaps...</p>
        </div>
      </div>
    );
  }

  const renderSwapCard = (swap: SwapRequest, isCompleted: boolean) => {
    const isSender = swap.senderId._id === user?.id || swap.senderId._id === user?._id;
    const partner = isSender ? swap.receiverId : swap.senderId;
    
    const iGive = isSender ? swap.skillOffered : swap.skillWanted;
    const iGet = isSender ? swap.skillWanted : swap.skillOffered;

    return (
      <div key={swap._id} className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden shrink-0 border border-blue-50">
              {partner.imageUrl ? (
                <img src={partner.imageUrl} alt={partner.firstName} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="text-blue-500" size={24} />
              )}
            </div>
            <div>
              <h3 className="font-bold text-[#0D1236] text-lg">Swap with {partner.firstName} {partner.lastName}</h3>
              <p className="text-sm text-gray-500">
                Started on {format(new Date(swap.createdAt), "MMM dd, yyyy")}
                {isCompleted && ` • Completed on ${format(new Date(swap.updatedAt), "MMM dd, yyyy")}`}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            {!isCompleted && (
              <button
                onClick={() => handleCompleteSwap(swap._id, `${partner.firstName} ${partner.lastName}`)}
                disabled={actionLoading === swap._id}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {actionLoading === swap._id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CheckCircle size={18} />
                )}
                Complete Swap
              </button>
            )}
            <Link 
              href="/dashboard/messages"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <MessageSquare size={18} />
              Message
            </Link>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full text-center sm:text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 block">You Teach</span>
            <span className="inline-block bg-blue-100 text-blue-700 font-medium px-3 py-1 rounded-full text-sm">
              {iGive}
            </span>
          </div>
          
          <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm border border-gray-100 shrink-0">
            <ArrowRightLeft className="text-gray-400" size={18} />
          </div>
          <div className="sm:hidden w-full flex justify-center">
            <ArrowRightLeft className="text-gray-400 rotate-90" size={18} />
          </div>

          <div className="flex-1 w-full text-center sm:text-right">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 block">You Learn</span>
            <span className="inline-block bg-purple-100 text-purple-700 font-medium px-3 py-1 rounded-full text-sm">
              {iGet}
            </span>
          </div>
        </div>

        {isCompleted && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {reviewedMap[swap._id] ? (
              <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                <CheckCircle size={16} />
                Review submitted
              </p>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm text-gray-600">How was your swap with {partner.firstName}?</p>
                <button
                  onClick={() => openReviewModal(swap._id, `${partner.firstName} ${partner.lastName}`)}
                  className="inline-flex items-center justify-center gap-1.5 bg-[#2A367E] hover:bg-[#1a2253] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Star size={16} />
                  Leave a Review
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-[#0D1236] mb-1">Rate this Swap Partnership</h2>
            <p className="text-sm text-gray-500 mb-4">
              How was your overall skill swap with {reviewModal.partnerName}?
            </p>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setReviewRating(star)}>
                  <Star
                    size={28}
                    className={star <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                  />
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
              <button
                type="button"
                onClick={() => handleSubmitReview(true)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Skip
              </button>
              <button
                type="button"
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1236]">My Swaps</h1>
          <p className="text-gray-500 mt-1">Track your active learning journeys and past exchanges.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        <div className="flex border-b border-[#E2E8F0]">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
              activeTab === "active" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowRightLeft size={18} />
              Active Swaps
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{activeSwaps.length}</span>
            </div>
            {activeTab === "active" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
              activeTab === "completed" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <History size={18} />
              Completed Swaps
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{completedSwaps.length}</span>
            </div>
            {activeTab === "completed" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
        </div>

        <div className="p-6">
          {activeTab === "active" ? (
            activeSwaps.length > 0 ? (
              <div className="space-y-4">
                {activeSwaps.map(swap => renderSwapCard(swap, false))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowRightLeft className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No Active Swaps</h3>
                <p className="text-gray-500 mb-4">You don't have any skill swaps in progress right now.</p>
                <Link href="/dashboard/discover" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                  Discover Partners
                </Link>
              </div>
            )
          ) : (
            completedSwaps.length > 0 ? (
              <div className="space-y-4">
                {completedSwaps.map(swap => renderSwapCard(swap, true))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No Completed Swaps</h3>
                <p className="text-gray-500">You haven't completed any skill swaps yet.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
