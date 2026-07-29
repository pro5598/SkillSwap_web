"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getRecommendations } from "@/api/users";
import { sendSwapRequest, getReceivedRequests, getSentRequests } from "@/api/requests";
import { getReviewsForUser } from "@/api/reviews";
import Link from "next/link";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string;
  bio?: string;
  skillsOffered: string[];
  skillsWanted: string[];
  experienceLevel?: string;
  role?: string;
}

export default function RecommendationsPage() {
  const { user: currentUser } = useAuth();
  const [recommendations, setRecommendations] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratings, setRatings] = useState<Record<string, { avg: number; total: number }>>({});
  const [swapStatusMap, setSwapStatusMap] = useState<Record<string, string>>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [skillOffered, setSkillOffered] = useState("");
  const [skillWanted, setSkillWanted] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [recRes, receivedRes, sentRes] = await Promise.all([
          getRecommendations(),
          getReceivedRequests(),
          getSentRequests(),
        ]);

        const users = recRes.data || [];
        setRecommendations(users);

        // Build swap status map
        const statusMap: Record<string, string> = {};
        const getPriority = (status: string) => {
          switch (status) {
            case "accepted": return 5;
            case "pending": return 4;
            case "completed": return 3;
            case "declined": return 2;
            case "cancelled": return 1;
            default: return 0;
          }
        };
        const processRequest = (req: any, otherUserId: string) => {
          const currentStatus = statusMap[otherUserId];
          if (!currentStatus || getPriority(req.status) > getPriority(currentStatus)) {
            statusMap[otherUserId] = req.status;
          }
        };
        receivedRes.data.requests.forEach((req: any) => {
          processRequest(req, req.senderId._id);
        });
        sentRes.data.requests.forEach((req: any) => {
          processRequest(req, req.receiverId._id);
        });
        setSwapStatusMap(statusMap);

        // Fetch ratings
        const ratingsMap: Record<string, { avg: number; total: number }> = {};
        const results = await Promise.allSettled(
          users.map((u: User) => getReviewsForUser(u._id))
        );
        results.forEach((result, i) => {
          if (result.status === "fulfilled") {
            const d = result.value.data;
            ratingsMap[users[i]._id] = { avg: d.averageRating || 0, total: d.total || 0 };
          }
        });
        setRatings(ratingsMap);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load recommendations. Make sure you have skills set in your profile.");
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchRecommendations();
    }
  }, [currentUser]);

  const handleOpenModal = (user: User) => {
    setSelectedUser(user);
    setSkillOffered(currentUser?.skillsOffered?.[0] || "");
    setSkillWanted(user.skillsOffered?.[0] || "");
    setMessage("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
      await sendSwapRequest({
        receiverId: selectedUser._id,
        skillOffered,
        skillWanted,
        message,
      });
      setSuccessMsg("Swap request sent successfully!");
      setTimeout(() => {
        handleCloseModal();
        setSuccessMsg("");
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send request");
      setTimeout(() => setError(""), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skeleton loader for cards
  const SkeletonCard = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-3 mb-6">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="flex gap-1">
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="h-6 bg-gray-200 rounded w-20" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="flex gap-1">
          <div className="h-6 bg-gray-200 rounded w-14" />
          <div className="h-6 bg-gray-200 rounded w-18" />
        </div>
      </div>
      <div className="h-10 bg-gray-200 rounded-lg" />
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-7 bg-gray-200 rounded w-56 animate-pulse" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-80 mt-2 animate-pulse" />
        </div>

        {/* AI thinking banner */}
        <div className="bg-gradient-to-r from-[#2A367E]/5 to-[#F4A261]/5 border border-[#2A367E]/10 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-6 h-6">
              <div className="absolute inset-0 rounded-full border-2 border-[#2A367E]/20 border-t-[#2A367E] animate-spin" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0D1236]">AI is analyzing skill synergies...</p>
              <p className="text-xs text-gray-500 mt-0.5">Finding the best matches based on your profile</p>
            </div>
          </div>
        </div>

        {/* Skeleton cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1236]">AI Recommendations</h1>
          </div>
        </div>
        <p className="text-gray-500 mt-2">Personalized skill swap matches powered by AI synergy analysis.</p>
      </div>

      {error && error.includes("Upgrade to Pro") ? (
        <div className="bg-gradient-to-r from-[#2A367E] to-[#0D1236] rounded-2xl p-8 text-center shadow-xl relative overflow-hidden mt-8">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-[#F4A261] rounded-full opacity-30 blur-2xl"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-[#F4A261]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#F4A261]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Unlock AI Recommendations</h3>
            <p className="text-blue-100 max-w-md mx-auto mb-8">
              Upgrade to SkillSwap Pro to get personalized, AI-powered skill synergy matches and accelerate your learning journey.
            </p>
            <Link
              href="/dashboard/subscription"
              className="inline-block px-8 py-3 bg-[#F4A261] text-white font-bold rounded-xl hover:bg-[#e28f4f] transition shadow-md"
            >
              View Pricing & Upgrade
            </Link>
          </div>
        </div>
      ) : error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="font-medium">Couldn&apos;t load recommendations</p>
            <p className="text-red-500 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Info banner when no skills set */}
      {!error && recommendations.length === 0 && (
        <div className="bg-gradient-to-r from-[#2A367E]/5 to-[#F4A261]/5 border border-[#2A367E]/10 rounded-xl p-6 text-center">

          <h3 className="text-lg font-semibold text-[#0D1236] mb-2">No recommendations yet</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            To get AI-powered recommendations, make sure your profile has skills you can offer and skills you want to learn. The AI needs this data to find your best matches.
          </p>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0D1236] text-white rounded-lg hover:bg-[#1a2359] transition text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Update Your Profile
          </Link>
        </div>
      )}

      {/* Recommendation cards */}
      {recommendations.length > 0 && (
        <>
          {/* AI badge */}
          <div className="bg-gradient-to-r from-[#2A367E]/5 to-[#F4A261]/5 border border-[#2A367E]/10 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2A367E] to-[#F4A261] flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-[#0D1236]">AI found {recommendations.length} match{recommendations.length !== 1 ? "es" : ""}</span>
              {" "}based on mutual skill synergy — people who offer what you want, and want what you offer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((u, index) => (
              <div
                key={u._id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-all duration-300 relative group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Rank badge */}
                <div className="absolute -top-2.5 -left-2.5 w-8 h-8 rounded-full bg-gradient-to-br from-[#2A367E] to-[#F4A261] flex items-center justify-center shadow-md">
                  <span className="text-white text-xs font-bold">#{index + 1}</span>
                </div>

                {/* AI match indicator */}
                <div className="absolute top-3 right-3">
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-[#2A367E]/10 to-[#F4A261]/10 rounded-full">

                    <span className="text-[10px] font-semibold text-[#2A367E]">AI Match</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-4 mt-1">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2A367E]/10 to-[#F4A261]/10 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-[#2A367E]/10">
                    {u.imageUrl ? (
                      <img src={`${u.imageUrl}`} alt={u.firstName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#2A367E] font-bold text-2xl">{u.firstName[0]}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{u.firstName} {u.lastName}</h3>
                    <p className="text-sm text-gray-500">{u.experienceLevel || "Enthusiast"}</p>
                    {ratings[u._id] && ratings[u._id].total > 0 && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        <span className="text-sm font-medium text-gray-700">{ratings[u._id].avg}</span>
                        <span className="text-xs text-gray-400">({ratings[u._id].total})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {u.bio && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2 italic">&ldquo;{u.bio}&rdquo;</p>
                )}

                <div className="flex-grow space-y-3 mb-6 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium text-xs uppercase tracking-wider block mb-1">Offers:</span>
                    <div className="flex flex-wrap gap-1">
                      {u.skillsOffered && u.skillsOffered.length > 0 ? u.skillsOffered.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100 text-xs">{s}</span>
                      )) : <span className="text-gray-400 italic">None specified</span>}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium text-xs uppercase tracking-wider block mb-1">Wants:</span>
                    <div className="flex flex-wrap gap-1">
                      {u.skillsWanted && u.skillsWanted.length > 0 ? u.skillsWanted.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md border border-purple-100 text-xs">{s}</span>
                      )) : <span className="text-gray-400 italic">None specified</span>}
                    </div>
                  </div>
                </div>

                {swapStatusMap[u._id] === "pending" || swapStatusMap[u._id] === "accepted" ? (
                  <div className={`w-full py-2.5 rounded-lg text-center font-medium transition cursor-not-allowed text-sm
                    ${swapStatusMap[u._id] === "accepted" ? "bg-green-50 text-green-700 border border-green-200" : "bg-yellow-50 text-yellow-700 border border-yellow-200"}
                  `}>
                    {swapStatusMap[u._id] === "accepted" ? "Swap in Progress" : "Request Pending"}
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenModal(u)}
                    className="w-full py-2.5 bg-gradient-to-r from-[#0D1236] to-[#2A367E] text-white rounded-lg hover:from-[#1a2359] hover:to-[#3a4a9e] transition-all text-sm font-medium shadow-sm hover:shadow-md"
                  >
                    Send Swap Request
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Swap Request Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-[#2A367E]/5 to-[#F4A261]/5">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#2A367E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                <h2 className="text-lg font-bold text-gray-900">Request a Skill Swap</h2>
              </div>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="p-6 space-y-4">
              {successMsg && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {successMsg}
                </div>
              )}
              <p className="text-sm text-gray-600 mb-4">
                Propose a swap with <span className="font-semibold">{selectedUser.firstName}</span> — an AI-recommended match.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">I will teach them (Skill Offered)</label>
                <input
                  type="text"
                  value={skillOffered}
                  onChange={(e) => setSkillOffered(e.target.value)}
                  placeholder="e.g. React.js, Spanish"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#2A367E]/30 focus:border-[#2A367E] outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">They will teach me (Skill Wanted)</label>
                <input
                  type="text"
                  value={skillWanted}
                  onChange={(e) => setSkillWanted(e.target.value)}
                  placeholder="e.g. Python, Guitar"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#2A367E]/30 focus:border-[#2A367E] outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hi! AI recommended you as a great match..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#2A367E]/30 focus:border-[#2A367E] outline-none h-24 resize-none transition"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !!successMsg}
                  className="px-4 py-2 bg-gradient-to-r from-[#0D1236] to-[#2A367E] text-white font-medium rounded-lg hover:from-[#1a2359] hover:to-[#3a4a9e] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
