"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F8F9FE] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-[#E2E8F0] max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-[#0D1236] mb-2 capitalize">Welcome {user?.username || 'User'}!</h1>
          <p className="text-[#4A5568] mb-6">You are logged in as {user?.email}.</p>
          <button 
            onClick={logout}
            className="px-6 py-2 bg-[#F4A261] hover:bg-[#e28f4f] text-white font-bold rounded-lg transition shadow-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
