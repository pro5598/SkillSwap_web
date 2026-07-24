"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getReceivedRequests } from "@/api/requests";
import { getUnreadMessagesCount } from "@/api/messages";
import { getMySessions } from "@/api/sessions";

interface NavCounts {
  pendingRequests: number;
  unreadMessages: number;
  pendingSessions: number;
}

/** Reusable badge pill */
function Badge({ count, color = "red" }: { count: number; color?: "red" | "blue" | "amber" }) {
  if (count <= 0) return null;
  const colorMap = {
    red: "bg-red-500 text-white",
    blue: "bg-blue-500 text-white",
    amber: "bg-[#F4A261] text-white",
  };
  return (
    <span
      className={`ml-1.5 flex h-4 min-w-[1rem] px-1 items-center justify-center rounded-full text-[10px] font-bold leading-none ${colorMap[color]}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function DashboardNavbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [counts, setCounts] = useState<NavCounts>({
    pendingRequests: 0,
    unreadMessages: 0,
    pendingSessions: 0,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const profileImageUrl = user?.imageUrl ? `${user.imageUrl}` : null;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch all badge counts in parallel
  const fetchCounts = useCallback(async () => {
    if (!user || user.role === "admin") return;
    try {
      const [requestsRes, messagesRes, sessionsRes] = await Promise.allSettled([
        getReceivedRequests(),
        getUnreadMessagesCount(),
        getMySessions(),
      ]);

      let pendingRequests = 0;
      let unreadMessages = 0;
      let pendingSessions = 0;

      if (requestsRes.status === "fulfilled") {
        const requests = requestsRes.value?.data?.requests || [];
        pendingRequests = requests.filter((r: any) => r.status === "pending").length;
      }

      if (messagesRes.status === "fulfilled") {
        // Backend returns { data: { count: N } } or { count: N }
        const res = messagesRes.value;
        unreadMessages = res?.data?.count ?? res?.count ?? 0;
      }

      if (sessionsRes.status === "fulfilled") {
        const sessions = sessionsRes.value?.data?.sessions || [];
        // Count sessions where current user is the PROVIDER (not requester) and status is "pending"
        const myId = user?.id || user?._id;
        pendingSessions = sessions.filter(
          (s: any) => s.status === "pending" && s.providerId?._id === myId
        ).length;
      }

      setCounts({ pendingRequests, unreadMessages, pendingSessions });
    } catch (err) {
      console.error("Failed to fetch nav counts", err);
    }
  }, [user]);

  useEffect(() => {
    fetchCounts();
    // Poll every 30 seconds to keep counts fresh
    const interval = setInterval(fetchCounts, 30_000);
    // Also refresh immediately when another part of the app signals it
    const handleRefresh = () => fetchCounts();
    window.addEventListener("skillswap:refresh-counts", handleRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("skillswap:refresh-counts", handleRefresh);
    };
  }, [fetchCounts]);

  const LogoIcon = () => (
    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2A367E] to-[#0D1236] flex items-center justify-center shadow-sm">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 16L3 12L7 8" stroke="#F4A261" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 8L21 12L17 16" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 4L10 20" stroke="#F4A261" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
  );

  // Total unread for profile avatar dot
  const totalAlerts = counts.pendingRequests + counts.unreadMessages + counts.pendingSessions;

  return (
    <nav className="bg-white border-b border-[#E2E8F0] px-4 py-3 sm:px-6 lg:px-8 shadow-sm relative z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto">

        {/* Logo */}
        <Link href={user?.role === "admin" ? "/admin/users" : "/dashboard"} className="flex items-center gap-2.5">
          <LogoIcon />
          <span className="text-2xl font-extrabold tracking-tight">
            <span className="text-[#0D1236]">Skill</span>
            <span className="text-[#F4A261]">Swap</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Desktop Nav Links */}
          {user?.role === "admin" ? (
            <div className="hidden md:flex gap-6 mr-4 items-center">
              <Link href="/admin/users" className="text-sm font-medium text-[#4A5568] hover:text-[#0D1236] transition-colors">Users</Link>
              <Link href="/admin/categories" className="text-sm font-medium text-[#4A5568] hover:text-[#0D1236] transition-colors">Categories</Link>
              <Link href="/admin/skills" className="text-sm font-medium text-[#4A5568] hover:text-[#0D1236] transition-colors">Skills</Link>
            </div>
          ) : (
            <div className="hidden md:flex gap-6 mr-4 items-center">
              <Link href="/dashboard/discover" className="text-sm font-medium text-[#4A5568] hover:text-[#0D1236] transition-colors">
                Discover
              </Link>

              {/* Requests badge */}
              <Link href="/dashboard/requests" className="text-sm font-medium text-[#4A5568] hover:text-[#0D1236] relative flex items-center transition-colors">
                Requests
                <Badge count={counts.pendingRequests} color="red" />
              </Link>

              {/* Messages badge */}
              <Link href="/dashboard/messages" className="text-sm font-medium text-[#4A5568] hover:text-[#0D1236] relative flex items-center transition-colors">
                Messages
                <Badge count={counts.unreadMessages} color="blue" />
              </Link>

              {/* Sessions badge */}
              <Link href="/dashboard/sessions" className="text-sm font-medium text-[#4A5568] hover:text-[#0D1236] relative flex items-center transition-colors">
                Sessions
                <Badge count={counts.pendingSessions} color="amber" />
              </Link>
            </div>
          )}

          {/* Avatar / Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 focus:outline-none transition-transform hover:scale-105"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#E2E8F0] shadow-sm bg-gray-100 flex items-center justify-center">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#0D1236] font-bold">
                    {user?.firstName?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg py-1 border border-[#E2E8F0] overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-[#0D1236] truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>

                <Link
                  href="/dashboard/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-[#4A5568] hover:bg-[#F8F9FE] hover:text-[#0D1236] transition-colors"
                >
                  My Profile
                </Link>

                {user?.role === "admin" ? (
                  <>
                    <div className="border-t border-gray-100 my-1" />
                    {[
                      { href: "/admin/users", label: "Users" },
                      { href: "/admin/categories", label: "Categories" },
                      { href: "/admin/skills", label: "Skills" },
                    ].map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setDropdownOpen(false)}
                        className="block md:hidden px-4 py-2 text-sm text-[#4A5568] hover:bg-[#F8F9FE] hover:text-[#0D1236] transition-colors"
                      >
                        {label}
                      </Link>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="border-t border-gray-100 my-1 block md:hidden" />

                    <Link
                      href="/dashboard/discover"
                      onClick={() => setDropdownOpen(false)}
                      className="block md:hidden px-4 py-2 text-sm text-[#4A5568] hover:bg-[#F8F9FE] hover:text-[#0D1236] transition-colors"
                    >
                      Discover
                    </Link>

                    {/* Mobile — Requests */}
                    <Link
                      href="/dashboard/requests"
                      onClick={() => setDropdownOpen(false)}
                      className="flex md:hidden justify-between items-center px-4 py-2 text-sm text-[#4A5568] hover:bg-[#F8F9FE] hover:text-[#0D1236] transition-colors"
                    >
                      Requests
                      <Badge count={counts.pendingRequests} color="red" />
                    </Link>

                    {/* Mobile — Messages */}
                    <Link
                      href="/dashboard/messages"
                      onClick={() => setDropdownOpen(false)}
                      className="flex md:hidden justify-between items-center px-4 py-2 text-sm text-[#4A5568] hover:bg-[#F8F9FE] hover:text-[#0D1236] transition-colors"
                    >
                      Messages
                      <Badge count={counts.unreadMessages} color="blue" />
                    </Link>

                    {/* Mobile — Sessions */}
                    <Link
                      href="/dashboard/sessions"
                      onClick={() => setDropdownOpen(false)}
                      className="flex md:hidden justify-between items-center px-4 py-2 text-sm text-[#4A5568] hover:bg-[#F8F9FE] hover:text-[#0D1236] transition-colors"
                    >
                      Sessions
                      <Badge count={counts.pendingSessions} color="amber" />
                    </Link>
                  </>
                )}

                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
