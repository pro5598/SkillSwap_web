"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMySessions } from "@/api/sessions";
import { getReceivedRequests } from "@/api/requests";
import { getUnreadMessagesCount } from "@/api/messages";
import Link from "next/link";
import {
  BookOpen, Lightbulb, Calendar, MessageSquare,
  ArrowRight, Search, Bell, Clock, Activity, Target
} from "lucide-react";

export default function DashboardHomePage() {
  const { user } = useAuth();
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [sessionsRes, requestsRes, messagesRes] = await Promise.allSettled([
          getMySessions(),
          getReceivedRequests(),
          getUnreadMessagesCount()
        ]);

        if (sessionsRes.status === "fulfilled") {
          const sessions = sessionsRes.value?.data?.sessions || [];
          const upcoming = sessions.filter(
            (s: any) => s.status === "accepted" || s.status === "pending"
          );
          setUpcomingCount(upcoming.length);
        }

        if (requestsRes.status === "fulfilled") {
          const requests = requestsRes.value?.data?.requests || [];
          const pending = requests.filter((r: any) => r.status === "pending");
          setPendingRequests(pending.length);
        }

        if (messagesRes.status === "fulfilled") {
          const res = messagesRes.value;
          setUnreadMessages(res?.data?.count ?? res?.count ?? 0);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Profile completion calculation
  const getProfileCompletion = () => {
    if (!user) return 0;
    let completed = 0;
    let total = 4;
    if (user.bio) completed++;
    if (user.skillsOffered && user.skillsOffered.length > 0) completed++;
    if (user.skillsWanted && user.skillsWanted.length > 0) completed++;
    if (user.experienceLevel) completed++;
    return Math.round((completed / total) * 100);
  };

  const profileCompletion = getProfileCompletion();

  // Dynamic Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const skillsOfferedCount = user?.skillsOffered?.length || 0;
  const skillsWantedCount = user?.skillsWanted?.length || 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#0D1236] via-[#1a2359] to-[#2A367E] text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2 opacity-90">
              <span className="text-sm font-semibold tracking-wider uppercase text-[#F4A261]">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-4xl font-extrabold mb-3 tracking-tight">
              {getGreeting()}, {user?.firstName || "Explorer"}!
            </h1>
            <p className="text-blue-100 max-w-xl text-lg leading-relaxed">
              Your next learning adventure awaits. Connect with experts, share your knowledge, and master new skills today.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/dashboard/discover"
                className="px-6 py-3 bg-[#F4A261] hover:bg-[#e28f4f] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Find Partners
              </Link>
              <Link
                href="/dashboard/recommendations"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold rounded-xl shadow-lg border border-white/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Target className="w-5 h-5" />
                AI Picks
              </Link>
            </div>
          </div>

          {/* Profile Completion Widget */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 w-full md:w-72 shadow-xl group-hover:bg-white/15 transition-colors">
            <h3 className="text-sm font-semibold text-blue-100 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#F4A261]" />
              Profile Strength
            </h3>
            <div className="flex items-end gap-3 mb-2">
              <span className="text-3xl font-bold">{profileCompletion}%</span>
            </div>
            <div className="w-full bg-blue-900/50 rounded-full h-2.5 mb-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#F4A261] to-amber-300 h-2.5 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
            {profileCompletion < 100 ? (
              <Link href="/dashboard/profile" className="text-sm text-[#F4A261] hover:text-amber-300 font-medium flex items-center gap-1 transition-colors">
                Complete your profile <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <p className="text-sm text-green-300 font-medium flex items-center gap-1">
                Profile completed!
              </p>
            )}
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFFFFF" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18,96.5,-2.5C96.2,12.9,89.5,28.2,79.8,41.2C70.1,54.2,57.3,64.9,43,72.4C28.7,79.9,13.1,84.1,-1.8,87.3C-16.7,90.4,-31.1,92.5,-44.6,87.6C-58.1,82.7,-70.7,70.9,-78.9,56.9C-87.1,42.9,-90.9,26.7,-91.6,11C-92.3,-4.7,-89.9,-19.9,-83.4,-33.4C-76.9,-46.9,-66.3,-58.7,-53.4,-66.4C-40.5,-74.1,-25.3,-77.7,-10.1,-79.1C5.1,-80.5,20.5,-79.7,30.5,-83.6L44.7,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Action Center */}
        <div className="lg:col-span-2 space-y-8">

          {/* Action Center */}
          {(pendingRequests > 0 || unreadMessages > 0) && (
            <div>
              <h2 className="text-xl font-bold text-[#0D1236] mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#F4A261]" /> Action Required
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pendingRequests > 0 && (
                  <Link href="/dashboard/requests" className="bg-orange-50 border border-orange-100 rounded-2xl p-5 hover:shadow-md hover:border-orange-200 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500 opacity-5 rounded-bl-full transform group-hover:scale-110 transition-transform"></div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm text-orange-500 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#0D1236] text-lg">{pendingRequests} Pending Request{pendingRequests > 1 ? 's' : ''}</h3>
                        <p className="text-sm text-[#4A5568] mt-1 mb-2">Someone wants to swap skills with you!</p>
                        <span className="text-orange-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">Review Now <ArrowRight className="w-4 h-4" /></span>
                      </div>
                    </div>
                  </Link>
                )}

                {unreadMessages > 0 && (
                  <Link href="/dashboard/messages" className="bg-blue-50 border border-blue-100 rounded-2xl p-5 hover:shadow-md hover:border-blue-200 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500 opacity-5 rounded-bl-full transform group-hover:scale-110 transition-transform"></div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm text-blue-500 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#0D1236] text-lg">{unreadMessages} Unread Message{unreadMessages > 1 ? 's' : ''}</h3>
                        <p className="text-sm text-[#4A5568] mt-1 mb-2">You have new messages from partners.</p>
                        <span className="text-blue-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">Read Messages <ArrowRight className="w-4 h-4" /></span>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Key Metrics */}
          <div>
            <h2 className="text-xl font-bold text-[#0D1236] mb-4">Your Metrics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-[#4A5568] font-medium mb-1">Skills Offered</h3>
                {statsLoading ? (
                  <div className="w-10 h-8 bg-gray-100 rounded animate-pulse"></div>
                ) : (
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-extrabold text-[#0D1236]">{skillsOfferedCount}</span>
                    <span className="text-sm font-medium text-indigo-600 mb-1">{skillsOfferedCount === 0 ? "Add to profile" : "Active"}</span>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h3 className="text-[#4A5568] font-medium mb-1">Skills Wanted</h3>
                {statsLoading ? (
                  <div className="w-10 h-8 bg-gray-100 rounded animate-pulse"></div>
                ) : (
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-extrabold text-[#0D1236]">{skillsWantedCount}</span>
                    <span className="text-sm font-medium text-emerald-600 mb-1">{skillsWantedCount === 0 ? "Add to profile" : "Seeking"}</span>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-[#4A5568] font-medium mb-1">Upcoming Sessions</h3>
                {statsLoading ? (
                  <div className="w-10 h-8 bg-gray-100 rounded animate-pulse"></div>
                ) : (
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-extrabold text-[#0D1236]">{upcomingCount}</span>
                    <span className="text-sm font-medium text-purple-600 mb-1">Scheduled</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E2E8F0] h-full sticky top-6">
            <h2 className="text-xl font-bold text-[#0D1236] mb-6">Quick Tools</h2>

            <div className="space-y-4">
              <Link href="/dashboard/discover" className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-[#E2E8F0] hover:bg-gray-50 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0D1236]">Find Partners</h3>
                  <p className="text-sm text-[#4A5568]">Browse and filter swaps</p>
                </div>
              </Link>

              <Link href="/dashboard/requests" className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-[#E2E8F0] hover:bg-gray-50 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0D1236]">Manage Requests</h3>
                  <p className="text-sm text-[#4A5568]">View sent and received</p>
                </div>
              </Link>

              <Link href="/dashboard/messages" className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-[#E2E8F0] hover:bg-gray-50 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-colors">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0D1236]">Messages</h3>
                  <p className="text-sm text-[#4A5568]">Chat with your matches</p>
                </div>
              </Link>

              <Link href="/dashboard/sessions" className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-[#E2E8F0] hover:bg-gray-50 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0D1236]">Sessions</h3>
                  <p className="text-sm text-[#4A5568]">Your learning calendar</p>
                </div>
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
              <Link href="/dashboard/profile" className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-[#0D1236] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors border border-gray-200">
                Update Profile Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
