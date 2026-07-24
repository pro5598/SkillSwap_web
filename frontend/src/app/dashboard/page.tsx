"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMySessions } from "@/api/sessions";
import Link from "next/link";

export default function DashboardHomePage() {
  const { user } = useAuth();
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const sessionsRes = await getMySessions();
        const sessions = sessionsRes.data?.sessions || [];
        const upcoming = sessions.filter(
          (s: any) => s.status === "accepted" || s.status === "pending"
        );
        setUpcomingCount(upcoming.length);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setStatsLoading(false);
      }
    };
    if (user) {
      fetchStats();
    }
  }, [user]);

  const skillsOfferedCount = user?.skillsOffered?.length || 0;
  const skillsWantedCount = user?.skillsWanted?.length || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#0D1236] text-white rounded-2xl p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold mb-2">
            Welcome back, {user?.firstName || "User"}!
          </h1>
          <p className="text-gray-300 max-w-xl">
            Ready to learn something new today? Check out your recent activity or explore new skills to barter.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href="/dashboard/discover"
              className="px-5 py-2 bg-[#F4A261] hover:bg-[#e28f4f] text-white font-semibold rounded-lg text-sm transition shadow-sm"
            >
              Discover Partners
            </Link>
            <Link
              href="/dashboard/profile"
              className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg text-sm transition border border-white/20"
            >
              Edit Profile
            </Link>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 opacity-10">
          <svg width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFFFFF" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18,96.5,-2.5C96.2,12.9,89.5,28.2,79.8,41.2C70.1,54.2,57.3,64.9,43,72.4C28.7,79.9,13.1,84.1,-1.8,87.3C-16.7,90.4,-31.1,92.5,-44.6,87.6C-58.1,82.7,-70.7,70.9,-78.9,56.9C-87.1,42.9,-90.9,26.7,-91.6,11C-92.3,-4.7,-89.9,-19.9,-83.4,-33.4C-76.9,-46.9,-66.3,-58.7,-53.4,-66.4C-40.5,-74.1,-25.3,-77.7,-10.1,-79.1C5.1,-80.5,20.5,-79.7,30.5,-83.6L44.7,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>
      </div>

      {/* Dashboard Stats / Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 - Skills Offered */}
        <Link href="/dashboard/profile" className="group">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0] hover:shadow-md transition-shadow h-full">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#0D1236]">Skills Offered</h3>
            <p className="text-[#4A5568] text-sm mt-1">Skills you are teaching others.</p>
            <div className="mt-4">
              {statsLoading ? (
                <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <>
                  <span className="text-2xl font-bold text-[#0D1236]">{skillsOfferedCount}</span>
                  <span className="text-sm text-gray-500 ml-2">{skillsOfferedCount === 0 ? "Add skills →" : "Active"}</span>
                </>
              )}
            </div>
          </div>
        </Link>

        {/* Card 2 - Skills Desired */}
        <Link href="/dashboard/profile" className="group">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0] hover:shadow-md transition-shadow h-full">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#0D1236]">Skills Desired</h3>
            <p className="text-[#4A5568] text-sm mt-1">Skills you want to learn.</p>
            <div className="mt-4">
              {statsLoading ? (
                <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <>
                  <span className="text-2xl font-bold text-[#0D1236]">{skillsWantedCount}</span>
                  <span className="text-sm text-gray-500 ml-2">{skillsWantedCount === 0 ? "Add skills →" : "Searching"}</span>
                </>
              )}
            </div>
          </div>
        </Link>

        {/* Card 3 - Upcoming Sessions */}
        <Link href="/dashboard/sessions" className="group">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0] hover:shadow-md transition-shadow h-full">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#0D1236]">Upcoming Exchanges</h3>
            <p className="text-[#4A5568] text-sm mt-1">Your scheduled learning sessions.</p>
            <div className="mt-4">
              {statsLoading ? (
                <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <>
                  <span className="text-2xl font-bold text-[#0D1236]">{upcomingCount}</span>
                  <span className="text-sm text-gray-500 ml-2">{upcomingCount === 0 ? "Schedule one →" : "Scheduled"}</span>
                </>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-semibold text-[#0D1236]">Quick Actions</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard/discover"
            className="flex items-center gap-3 p-4 rounded-xl border border-[#E2E8F0] hover:border-[#2A367E] hover:bg-[#F8F9FE] transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-[#0D1236] text-sm">Find Partners</p>
              <p className="text-xs text-gray-500">Browse available swaps</p>
            </div>
          </Link>

          <Link
            href="/dashboard/requests"
            className="flex items-center gap-3 p-4 rounded-xl border border-[#E2E8F0] hover:border-[#2A367E] hover:bg-[#F8F9FE] transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-[#0D1236] text-sm">View Requests</p>
              <p className="text-xs text-gray-500">Manage swap proposals</p>
            </div>
          </Link>

          <Link
            href="/dashboard/messages"
            className="flex items-center gap-3 p-4 rounded-xl border border-[#E2E8F0] hover:border-[#2A367E] hover:bg-[#F8F9FE] transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-[#0D1236] text-sm">Messages</p>
              <p className="text-xs text-gray-500">Chat with your matches</p>
            </div>
          </Link>

          <Link
            href="/dashboard/sessions"
            className="flex items-center gap-3 p-4 rounded-xl border border-[#E2E8F0] hover:border-[#2A367E] hover:bg-[#F8F9FE] transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-[#0D1236] text-sm">Sessions</p>
              <p className="text-xs text-gray-500">Schedule & manage</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
