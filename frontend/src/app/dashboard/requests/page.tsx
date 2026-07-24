"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getReceivedRequests, getSentRequests, respondToSwapRequest } from "@/api/requests";
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

  const handleRespond = async (id: string, status: "accepted" | "declined" | "cancelled") => {
    try {
      await respondToSwapRequest(id, status);
      fetchRequests(); // Refresh the lists
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${status} request`);
      setTimeout(() => setError(""), 4000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">Pending</span>;
      case "accepted":
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Accepted</span>;
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
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
