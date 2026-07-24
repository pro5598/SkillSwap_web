"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getReceivedRequests, getSentRequests } from "@/api/requests";
import { createSession, getMySessions, updateSessionStatus } from "@/api/sessions";
import { Calendar, Clock, Video, User as UserIcon, Check, X } from "lucide-react";
import { format } from "date-fns";

type Contact = {
  id: string;
  name: string;
};

type Session = {
  _id: string;
  requesterId: { _id: string; firstName: string; lastName: string; imageUrl?: string };
  providerId: { _id: string; firstName: string; lastName: string; imageUrl?: string };
  scheduledAt: string;
  status: "pending" | "accepted" | "declined" | "completed" | "cancelled";
  meetingDetails?: string;
};

export default function SessionsPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [selectedContactId, setSelectedContactId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [meetingDetails, setMeetingDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [receivedRes, sentRes, sessionsRes] = await Promise.all([
        getReceivedRequests(),
        getSentRequests(),
        getMySessions(),
      ]);

      setSessions(sessionsRes.data.sessions);

      const acceptedContacts: Contact[] = [];

      receivedRes.data.requests.forEach((req: any) => {
        if (req.status === "accepted") {
          acceptedContacts.push({
            id: req.senderId._id,
            name: `${req.senderId.firstName} ${req.senderId.lastName}`,
          });
        }
      });

      sentRes.data.requests.forEach((req: any) => {
        if (req.status === "accepted") {
          acceptedContacts.push({
            id: req.receiverId._id,
            name: `${req.receiverId.firstName} ${req.receiverId.lastName}`,
          });
        }
      });

      const uniqueContacts = acceptedContacts.filter((contact, index, self) =>
        index === self.findIndex((t) => t.id === contact.id)
      );
      setContacts(uniqueContacts);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContactId || !scheduledAt) return;

    try {
      setSubmitting(true);
      await createSession({
        providerId: selectedContactId,
        scheduledAt,
        meetingDetails,
      });
      // Reset form
      setSelectedContactId("");
      setScheduledAt("");
      setMeetingDetails("");
      // Refresh sessions
      fetchData();
    } catch (error) {
      console.error("Failed to create session", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (sessionId: string, status: string) => {
    try {
      await updateSessionStatus(sessionId, status);
      fetchData(); // Refresh list
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#2A367E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1236]">Sessions</h1>
          <p className="text-gray-500">Schedule and manage your skill swap meetings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Propose a Session Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
            <div className="p-4 border-b border-[#E2E8F0] bg-gray-50">
              <h2 className="font-semibold text-[#0D1236]">Propose a Session</h2>
            </div>
            <form onSubmit={handleCreateSession} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Partner</label>
                <select
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>Select an accepted match</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Zoom link, Google Meet, or coffee shop"
                  value={meetingDetails}
                  onChange={(e) => setMeetingDetails(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedContactId || !scheduledAt}
                className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? "Sending Proposal..." : "Send Proposal"}
              </button>
            </form>
          </div>
        </div>

        {/* Sessions List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-[#0D1236]">Upcoming & Pending Sessions</h2>
          
          {sessions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-8 text-center text-gray-500">
              <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p>No sessions scheduled yet.</p>
              <p className="text-sm">Propose a session with one of your matches to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const isRequester = session.requesterId._id === user?.id || session.requesterId._id === user?._id;
                const partner = isRequester ? session.providerId : session.requesterId;
                const date = new Date(session.scheduledAt);
                
                return (
                  <div key={session._id} className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden shrink-0">
                        {partner.imageUrl ? (
                          <img src={partner.imageUrl} alt={partner.firstName} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#0D1236] text-lg">Swap with {partner.firstName} {partner.lastName}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1"><Calendar size={14} /> {format(date, "MMM dd, yyyy")}</span>
                          <span className="flex items-center gap-1"><Clock size={14} /> {format(date, "h:mm a")}</span>
                          {session.meetingDetails && (
                            <span className="flex items-center gap-1"><Video size={14} /> {session.meetingDetails}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
                        ${session.status === 'accepted' ? 'bg-green-100 text-green-700' : ''}
                        ${session.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${session.status === 'declined' || session.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                        ${session.status === 'completed' ? 'bg-gray-100 text-gray-700' : ''}
                      `}>
                        {session.status}
                      </div>

                      {session.status === "pending" && !isRequester && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateStatus(session._id, "accepted")}
                            className="bg-green-500 text-white p-1.5 rounded hover:bg-green-600"
                            title="Accept"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(session._id, "declined")}
                            className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600"
                            title="Decline"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                      
                      {session.status === "accepted" && (
                         <div className="flex gap-2 items-center">
                           <button
                             onClick={() => handleUpdateStatus(session._id, "completed")}
                             className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1 font-medium border border-green-200 hover:border-green-400 px-2 py-1 rounded transition"
                             title="Mark as Completed"
                           >
                             <Check size={14} />
                             Completed
                           </button>
                           <button
                             onClick={() => handleUpdateStatus(session._id, "cancelled")}
                             className="text-gray-400 hover:text-red-500 text-sm flex items-center gap-1 transition"
                           >
                             Cancel
                           </button>
                         </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
