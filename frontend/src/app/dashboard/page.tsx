"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function DashboardHomePage() {
  const { user } = useAuth();

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
        {/* Card 1 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0] hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#0D1236]">Skills Offered</h3>
          <p className="text-[#4A5568] text-sm mt-1">Manage the skills you are teaching others.</p>
          <div className="mt-4">
            <span className="text-2xl font-bold text-[#0D1236]">3</span>
            <span className="text-sm text-gray-500 ml-2">Active</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0] hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#0D1236]">Skills Desired</h3>
          <p className="text-[#4A5568] text-sm mt-1">Skills you are currently looking to learn.</p>
          <div className="mt-4">
            <span className="text-2xl font-bold text-[#0D1236]">2</span>
            <span className="text-sm text-gray-500 ml-2">Searching</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0] hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#0D1236]">Upcoming Exchanges</h3>
          <p className="text-[#4A5568] text-sm mt-1">Your scheduled learning sessions.</p>
          <div className="mt-4">
            <span className="text-2xl font-bold text-[#0D1236]">0</span>
            <span className="text-sm text-gray-500 ml-2">Scheduled</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-semibold text-[#0D1236]">Recent Activity</h2>
        </div>
        <div className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-[#0D1236] font-medium">No recent activity</h3>
          <p className="text-sm text-gray-500 mt-1">Your recent skill exchanges and updates will appear here.</p>
        </div>
      </div>
    </div>
  );
}
