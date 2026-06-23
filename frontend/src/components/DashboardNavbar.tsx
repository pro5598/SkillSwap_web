"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function DashboardNavbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const profileImageUrl = user?.imageUrl 
    ? `http://localhost:5000${user.imageUrl}` 
    : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-[#E2E8F0] px-4 py-3 sm:px-6 lg:px-8 shadow-sm relative z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F4A261] rounded-lg flex items-center justify-center font-bold text-white">
            S
          </div>
          <span className="text-xl font-bold text-[#0D1236]">SkillSwap</span>
        </Link>

        <div className="flex items-center gap-4">
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
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 border border-[#E2E8F0] overflow-hidden">
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

                <div className="border-t border-gray-100 my-1"></div>
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
