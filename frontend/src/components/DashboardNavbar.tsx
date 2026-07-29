"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getReceivedRequests } from "@/api/requests";
import { getUnreadMessagesCount } from "@/api/messages";
import { getMySessions } from "@/api/sessions";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/api/notifications";
import axiosInstance from "@/api/axios";
import { Bell, Check, Circle } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  
  const [counts, setCounts] = useState<NavCounts>({
    pendingRequests: 0,
    unreadMessages: 0,
    pendingSessions: 0,
  });

  const [pendingSkills, setPendingSkills] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  const profileImageUrl = user?.imageUrl ? `${user.imageUrl}` : null;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch all badge counts in parallel
  const fetchCounts = useCallback(async () => {
    if (!user) return;

    // Admin-specific counts
    if (user.role === "admin") {
      try {
        const res = await axiosInstance.get("/skills/pending-count");
        setPendingSkills(res?.data?.data?.count ?? 0);
      } catch (err) {
        console.error("Failed to fetch admin counts", err);
      }
      return;
    }

    // User counts
    try {
      const [requestsRes, messagesRes, sessionsRes, notifRes] = await Promise.allSettled([
        getReceivedRequests(),
        getUnreadMessagesCount(),
        getMySessions(),
        getNotifications()
      ]);

      let pendingRequests = 0;
      let unreadMessages = 0;
      let pendingSessions = 0;

      if (requestsRes.status === "fulfilled") {
        const requests = requestsRes.value?.data?.requests || [];
        pendingRequests = requests.filter((r: any) => r.status === "pending").length;
      }

      if (messagesRes.status === "fulfilled") {
        const res = messagesRes.value;
        unreadMessages = res?.data?.count ?? res?.count ?? 0;
      }

      if (sessionsRes.status === "fulfilled") {
        const sessions = sessionsRes.value?.data?.sessions || [];
        const myId = user?.id || user?._id;
        pendingSessions = sessions.filter(
          (s: any) => s.status === "pending" && s.providerId?._id === myId
        ).length;
      }

      if (notifRes.status === "fulfilled" && notifRes.value?.data?.data) {
        setNotifications(notifRes.value.data.data.notifications || []);
        setUnreadNotifications(notifRes.value.data.data.unreadCount || 0);
      }

      setCounts({ pendingRequests, unreadMessages, pendingSessions });
    } catch (err) {
      console.error("Failed to fetch nav counts", err);
    }
  }, [user]);

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 30_000);
    const handleRefresh = () => fetchCounts();
    window.addEventListener("skillswap:refresh-counts", handleRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("skillswap:refresh-counts", handleRefresh);
    };
  }, [fetchCounts]);

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      try {
        await markNotificationAsRead(notif._id);
        fetchCounts();
      } catch (err) {
        console.error("Failed to mark notification as read", err);
      }
    }
    setNotifDropdownOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAllNotificationsAsRead();
      fetchCounts();
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const LogoIcon = () => (
    <img src="/logo.png" alt="SkillSwap Logo" className="w-9 h-9 object-contain" />
  );

  return (
    <nav className="bg-white border-b border-[#E2E8F0] px-4 py-3 sm:px-6 lg:px-8 shadow-sm relative z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto">

        {/* Logo */}
        <Link href={user?.role === "admin" ? "/admin" : "/dashboard"} className="flex items-center gap-2.5">
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
              <Link href="/admin" className="text-sm font-medium text-[#4A5568] hover:text-[#0D1236] transition-colors">Dashboard</Link>
              <Link href="/admin/users" className="text-sm font-medium text-[#4A5568] hover:text-[#0D1236] transition-colors">Users</Link>
              <Link href="/admin/skills" className="text-sm font-medium text-[#4A5568] hover:text-[#0D1236] relative flex items-center transition-colors">
                Skills
                <Badge count={pendingSkills} color="amber" />
              </Link>
              <Link href="/admin/swap-requests" className="text-sm font-medium text-[#4A5568] hover:text-[#0D1236] transition-colors">Requests</Link>
              <Link href="/admin/sessions" className="text-sm font-medium text-[#4A5568] hover:text-[#0D1236] transition-colors">Sessions</Link>
            </div>
          ) : (
            <div className="hidden md:flex gap-6 mr-4 items-center">
              <Link href="/dashboard/discover" className="text-sm font-medium text-[#4A5568] hover:text-[#0D1236] transition-colors">
                Discover
              </Link>
              <Link href="/dashboard/recommendations" className="text-sm font-medium text-[#4A5568] hover:text-[#0D1236] transition-colors flex items-center gap-1">
                AI Picks
              </Link>
              <Link href="/dashboard/requests" className="text-sm font-medium text-[#4A5568] hover:text-[#0D1236] relative flex items-center transition-colors">
                Requests
                <Badge count={counts.pendingRequests} color="red" />
              </Link>
              <Link href="/dashboard/swaps" className="text-sm font-medium text-[#4A5568] hover:text-[#0D1236] transition-colors">
                Swaps
              </Link>
              <Link href="/dashboard/messages" className="text-sm font-medium text-[#4A5568] hover:text-[#0D1236] relative flex items-center transition-colors">
                Messages
                <Badge count={counts.unreadMessages} color="blue" />
              </Link>
              <Link href="/dashboard/sessions" className="text-sm font-medium text-[#4A5568] hover:text-[#0D1236] relative flex items-center transition-colors">
                Sessions
                <Badge count={counts.pendingSessions} color="amber" />
              </Link>
            </div>
          )}

          {/* Notifications Dropdown */}
          {user && user.role !== "admin" && (
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 text-gray-500 hover:text-[#0D1236] transition-colors focus:outline-none"
              >
                <Bell className="w-6 h-6" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl py-1 border border-[#E2E8F0] overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-semibold text-[#0D1236]">Notifications</h3>
                    {unreadNotifications > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-xs text-[#F4A261] hover:text-amber-600 font-medium flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-[350px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((notif: any) => (
                        <div 
                          key={notif._id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                        >
                          <div className="flex-shrink-0 mt-1">
                            {!notif.isRead ? (
                              <Circle className="w-2.5 h-2.5 fill-blue-500 text-blue-500" />
                            ) : (
                              <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                            )}
                          </div>
                          <div>
                            <p className={`text-sm ${!notif.isRead ? 'text-[#0D1236] font-medium' : 'text-gray-600'}`}>
                              {notif.content}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg py-1 border border-[#E2E8F0] overflow-hidden z-50">
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
                      { href: "/admin", label: "Dashboard" },
                      { href: "/admin/users", label: "Users" },
                      { href: "/admin/skills", label: "Skills" },
                      { href: "/admin/swap-requests", label: "Requests" },
                      { href: "/admin/sessions", label: "Sessions" },
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

                    <Link
                      href="/dashboard/recommendations"
                      onClick={() => setDropdownOpen(false)}
                      className="block md:hidden px-4 py-2 text-sm text-[#4A5568] hover:bg-[#F8F9FE] hover:text-[#0D1236] transition-colors"
                    >
                      AI Picks
                    </Link>

                    <Link
                      href="/dashboard/requests"
                      onClick={() => setDropdownOpen(false)}
                      className="flex md:hidden justify-between items-center px-4 py-2 text-sm text-[#4A5568] hover:bg-[#F8F9FE] hover:text-[#0D1236] transition-colors"
                    >
                      Requests
                      <Badge count={counts.pendingRequests} color="red" />
                    </Link>

                    <Link
                      href="/dashboard/swaps"
                      onClick={() => setDropdownOpen(false)}
                      className="block md:hidden px-4 py-2 text-sm text-[#4A5568] hover:bg-[#F8F9FE] hover:text-[#0D1236] transition-colors"
                    >
                      Swaps
                    </Link>

                    <Link
                      href="/dashboard/messages"
                      onClick={() => setDropdownOpen(false)}
                      className="flex md:hidden justify-between items-center px-4 py-2 text-sm text-[#4A5568] hover:bg-[#F8F9FE] hover:text-[#0D1236] transition-colors"
                    >
                      Messages
                      <Badge count={counts.unreadMessages} color="blue" />
                    </Link>

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
