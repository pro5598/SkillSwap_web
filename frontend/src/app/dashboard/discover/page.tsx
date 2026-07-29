"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAllUsers } from "@/api/users";
import { sendSwapRequest, getReceivedRequests, getSentRequests } from "@/api/requests";
import { getReviewsForUser } from "@/api/reviews";

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

export default function DiscoverPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
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

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [res, receivedRes, sentRes] = await Promise.all([
          getAllUsers(),
          getReceivedRequests(),
          getSentRequests(),
        ]);
        const otherUsers = res.data.users.filter(
          (u: User) => u._id !== currentUser?._id && u._id !== currentUser?.id && u.role !== "admin"
        );
        setUsers(otherUsers);

        // Build swap status map
        const statusMap: Record<string, string> = {};
        
        // Helper to prioritize status (accepted > pending > completed > declined > cancelled)
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

        // Fetch ratings for all users
        const ratingsMap: Record<string, { avg: number; total: number }> = {};
        const results = await Promise.allSettled(
          otherUsers.map((u: User) => getReviewsForUser(u._id))
        );
        results.forEach((result, i) => {
          if (result.status === "fulfilled") {
            const d = result.value.data;
            ratingsMap[otherUsers[i]._id] = { avg: d.averageRating || 0, total: d.total || 0 };
          }
        });
        setRatings(ratingsMap);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchUsers();
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
        message
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

  // Filter users based on search query
  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(query) ||
      u.lastName.toLowerCase().includes(query) ||
      (u.skillsOffered || []).some((s) => s.toLowerCase().includes(query)) ||
      (u.skillsWanted || []).some((s) => s.toLowerCase().includes(query)) ||
      (u.experienceLevel || "").toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#2A367E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1236]">Discover</h1>
          <p className="text-gray-500 mt-1">Find people to exchange skills with.</p>
        </div>
        {/* Search bar */}
        <div className="relative w-full sm:w-72">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or skill..."
            className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2A367E]/20 focus:border-[#2A367E] transition"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-xl text-center shadow-sm border border-gray-100">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">
              {searchQuery ? "No users match your search." : "No other users found right now."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-sm text-[#2A367E] font-medium hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          filteredUsers.map((u) => (
            <div key={u._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {u.imageUrl ? (
                    <img src={`${u.imageUrl}`} alt={u.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-green-600 font-bold text-2xl">{u.firstName[0]}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{u.firstName} {u.lastName}</h3>
                  <p className="text-sm text-gray-500">{u.experienceLevel || "Enthusiast"}</p>
                  {ratings[u._id] && ratings[u._id].total > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      <span className="text-sm font-medium text-gray-700">{ratings[u._id].avg}</span>
                      <span className="text-xs text-gray-400">({ratings[u._id].total})</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-grow space-y-3 mb-6 text-sm">
                <div>
                  <span className="text-gray-500 font-medium text-xs uppercase tracking-wider block mb-1">Offers:</span>
                  <div className="flex flex-wrap gap-1">
                    {u.skillsOffered && u.skillsOffered.length > 0 ? u.skillsOffered.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100">{s}</span>
                    )) : <span className="text-gray-400 italic">None specified</span>}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 font-medium text-xs uppercase tracking-wider block mb-1">Wants:</span>
                  <div className="flex flex-wrap gap-1">
                    {u.skillsWanted && u.skillsWanted.length > 0 ? u.skillsWanted.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md border border-purple-100">{s}</span>
                    )) : <span className="text-gray-400 italic">None specified</span>}
                  </div>
                </div>
              </div>
              
              {swapStatusMap[u._id] === "pending" || swapStatusMap[u._id] === "accepted" ? (
                <div className={`w-full py-2 rounded-lg text-center font-medium transition cursor-not-allowed
                  ${swapStatusMap[u._id] === "accepted" ? "bg-green-50 text-green-700 border border-green-200" : "bg-yellow-50 text-yellow-700 border border-yellow-200"}
                `}>
                  {swapStatusMap[u._id] === "accepted" ? "Swap in Progress" : "Request Pending"}
                </div>
              ) : (
                <button 
                  onClick={() => handleOpenModal(u)}
                  className="w-full py-2 bg-[#0D1236] text-white rounded-lg hover:bg-[#1a2359] transition"
                >
                  Send Request
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Swap Request Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Request a Skill Swap</h2>
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
                Propose a swap with <span className="font-semibold">{selectedUser.firstName}</span>.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">I will teach them (Skill Offered)</label>
                <input 
                  type="text" 
                  value={skillOffered}
                  onChange={(e) => setSkillOffered(e.target.value)}
                  placeholder="e.g. React.js, Spanish"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hi! I'd love to swap skills with you..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
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
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
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
