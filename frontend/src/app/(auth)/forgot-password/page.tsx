"use client";

import { useState } from "react";
import Link from "next/link";
import axiosInstance from "@/api/axios";
import GuestRoute from "@/components/GuestRoute";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GuestRoute>
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-[#0D1236]">
            Forgot Password
          </h2>
          <p className="text-sm text-[#4A5568]">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              If an account with that email exists, a password reset link has been sent. Please check your inbox.
            </div>
            <Link
              href="/login"
              className="block w-full text-center bg-[#F4A261] hover:bg-[#e28f4f] text-[#FFFFFF] font-bold py-2.5 rounded-lg text-sm transition shadow-sm"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[#0D1236] mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#E2E8F0] p-2.5 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] outline-none transition focus:ring-2 focus:ring-[#2A367E]/20 focus:border-[#2A367E]"
                placeholder="name@domain.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#F4A261] hover:bg-[#e28f4f] disabled:bg-[#F4A261]/60 text-[#FFFFFF] font-bold py-2.5 rounded-lg text-sm transition mt-2 shadow-sm"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>

            <p className="text-center text-sm text-[#4A5568] mt-4">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-[#2A367E] font-bold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </form>
        )}
      </div>
    </GuestRoute>
  );
}
