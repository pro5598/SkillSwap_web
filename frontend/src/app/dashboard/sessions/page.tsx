"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getReceivedRequests, getSentRequests } from "@/api/requests";
import { getMySessions, updateSessionStatus, scheduleSession, createFollowUpSession } from "@/api/sessions";
import { Calendar, Clock, Video, User as UserIcon, Check, X, Star } from "lucide-react";
import { format } from "date-fns";

type Contact = {
  id: string;
  name: string;
};

type Session = {
  _id: string;
  requesterId: { _id: string; firstName: string; lastName: string; imageUrl?: string };
  providerId: { _id: string; firstName: string; lastName: string; imageUrl?: string };
  skillName?: string;
  scheduledAt?: string;
  status: "pending" | "accepted" | "declined" | "completed" | "cancelled";
  meetingDetails?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
};

export default function SessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [meetingDetails, setMeetingDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [followUpSessionId, setFollowUpSessionId] = useState("");
  const [followUpScheduledAt, setFollowUpScheduledAt] = useState("");
  const [followUpMeetingDetails, setFollowUpMeetingDetails] = useState("");

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const sessionsRes = await getMySessions();
      setSessions(sessionsRes.data.sessions);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !scheduledAt) return;

    try {
      setSubmitting(true);
      await scheduleSession(selectedSessionId, {
        scheduledAt,
        meetingDetails,
      });
      // Reset form
      setSelectedSessionId("");
      setScheduledAt("");
      setMeetingDetails("");
      // Refresh sessions
      fetchData();
    } catch (error) {
      console.error("Failed to schedule session", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (sessionId: string, status: string) => {
    try {
      await updateSessionStatus(sessionId, status);
      fetchData();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleFollowUp = (sessionId: string) => {
    setFollowUpSessionId(sessionId);
    setFollowUpScheduledAt("");
    setFollowUpMeetingDetails("");
    setIsFollowUpModalOpen(true);
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpSessionId) return;

    try {
      setSubmitting(true);
      await createFollowUpSession(followUpSessionId, {
        scheduledAt: followUpScheduledAt,
        meetingDetails: followUpMeetingDetails,
      });
      setIsFollowUpModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Failed to create follow up session", error);
    } finally {
      setSubmitting(false);
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
              <h2 className="font-semibold text-[#0D1236]">Schedule a Session</h2>
            </div>
            <form onSubmit={handleScheduleSession} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Pending Session</label>
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>Select a session to schedule</option>
                  {sessions
                    .filter((s) => s.status === "pending" && !s.scheduledAt)
                    .map((s) => {
                      const isReq = s.requesterId._id === user?.id || s.requesterId._id === user?._id;
                      const role = isReq ? "Learn" : "Teach";
                      const part = isReq ? s.providerId : s.requesterId;
                      return (
                        <option key={s._id} value={s._id}>
                          {role} {s.skillName} (with {part.firstName})
                        </option>
                      );
                    })}
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
                disabled={submitting || !selectedSessionId || !scheduledAt}
                className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? "Saving Schedule..." : "Save Schedule"}
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
                const date = session.scheduledAt ? new Date(session.scheduledAt) : null;
                
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
                        <p className="text-sm font-medium text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded-md mt-1 mb-1">
                          {isRequester ? "Learning" : "Teaching"}: {session.skillName || "General Swap"}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                          {date ? (
                            <>
                              <span className="flex items-center gap-1"><Calendar size={14} /> {format(date, "MMM dd, yyyy")}</span>
                              <span className="flex items-center gap-1"><Clock size={14} /> {format(date, "h:mm a")}</span>
                            </>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-600"><Calendar size={14} /> Unscheduled</span>
                          )}
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

                      {session.status === "pending" && (session.createdBy ? session.createdBy !== (user?.id || user?._id) : !isRequester) && (
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

                      {session.status === "pending" && (session.createdBy ? session.createdBy === (user?.id || user?._id) : isRequester) && (
                        <span className="text-sm text-gray-500 italic">Waiting for partner...</span>
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
                      {(session.status === "completed" || session.status === "accepted") && (
                        <button
                          onClick={() => handleFollowUp(session._id)}
                          className="ml-2 text-blue-600 hover:text-blue-700 text-sm font-medium border border-blue-200 hover:border-blue-400 px-2 py-1 rounded transition whitespace-nowrap"
                        >
                          + Follow-up
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Follow Up Session Modal */}
      {isFollowUpModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Schedule Follow-up</h2>
              <button onClick={() => setIsFollowUpModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleFollowUpSubmit} className="p-6 space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Propose a date and time for your next follow-up session.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time (Optional)</label>
                <input
                  type="datetime-local"
                  value={followUpScheduledAt}
                  onChange={(e) => setFollowUpScheduledAt(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link / Location (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Zoom link, Google Meet, or coffee shop"
                  value={followUpMeetingDetails}
                  onChange={(e) => setFollowUpMeetingDetails(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsFollowUpModalOpen(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Create Follow-up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
