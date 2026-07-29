"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { createCheckoutSession, verifyCheckoutSession } from "@/api/stripe";
import { useSearchParams, useRouter } from "next/navigation";

export default function SubscriptionPage() {
  const { user, checkSession } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const verifyRef = useRef(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const success = searchParams.get("success");

    if (success === "true" && sessionId && !verifyRef.current) {
      verifyRef.current = true;
      setIsVerifying(true);
      verifyCheckoutSession(sessionId)
        .then(() => {
          return checkSession();
        })
        .then(() => {
          setIsVerifying(false);
          setIsSuccess(true);
          window.history.replaceState(null, '', '/dashboard/subscription');
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to verify subscription. If you paid, please contact support.");
          setIsVerifying(false);
        });
    }
  }, [searchParams, checkSession]);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await createCheckoutSession();
      if (res?.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError("Failed to create checkout session.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to initiate checkout");
    } finally {
      setIsLoading(false);
    }
  };

  const isPro = user?.subscriptionStatus === "pro";

  if (isVerifying) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#F4A261] border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-2xl font-bold text-[#0D1236]">Verifying your payment...</h2>
        <p className="text-gray-500 mt-2">Please wait while we upgrade your account.</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#0D1236]">Subscription Successful!</h2>
        <p className="text-gray-500 mt-2">Thank you for upgrading to SkillSwap Pro. You now have access to AI recommendations and priority support.</p>
        <button 
          onClick={() => router.push('/dashboard')} 
          className="mt-8 px-6 py-3 bg-[#F4A261] hover:bg-[#e28f4f] text-white rounded-xl font-semibold shadow-md transition-all"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-[#0D1236] sm:text-4xl">
          Upgrade to SkillSwap Pro
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Unlock the full potential of your learning journey with advanced AI tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Free Tier */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Basic</h3>
          <p className="text-gray-500 mb-6">Perfect for getting started</p>
          <div className="mb-6">
            <span className="text-4xl font-extrabold text-gray-900">$0</span>
            <span className="text-gray-500 font-medium">/month</span>
          </div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center text-gray-600">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Unlimited manual swap requests
            </li>
            <li className="flex items-center text-gray-600">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Basic messaging
            </li>
            <li className="flex items-center text-gray-400">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              No AI Recommendations
            </li>
          </ul>
          <button
            disabled
            className="w-full py-3 px-4 rounded-xl font-semibold text-center bg-gray-100 text-gray-500 cursor-not-allowed"
          >
            Current Plan
          </button>
        </div>

        {/* Pro Tier */}
        <div className="bg-gradient-to-b from-[#2A367E] to-[#0D1236] rounded-2xl shadow-xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-[#F4A261] rounded-full opacity-50 blur-2xl"></div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
            <p className="text-blue-200 mb-6">Supercharge your learning</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-white">$9.99</span>
              <span className="text-blue-200 font-medium">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-white">
                <svg className="w-5 h-5 text-[#F4A261] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Everything in Basic
              </li>
              <li className="flex items-center text-white font-medium">
                <svg className="w-5 h-5 text-[#F4A261] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                AI Synergy Recommendations
              </li>
              <li className="flex items-center text-white">
                <svg className="w-5 h-5 text-[#F4A261] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Priority Support
              </li>
            </ul>

            {error && (
              <p className="text-red-300 text-sm mb-4 text-center">{error}</p>
            )}

            {isPro ? (
              <button
                disabled
                className="w-full py-3 px-4 rounded-xl font-bold text-center bg-white/20 text-white cursor-not-allowed"
              >
                Already Subscribed
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-center bg-[#F4A261] hover:bg-[#e28f4f] text-white transition-all shadow-md disabled:opacity-70 disabled:cursor-wait"
              >
                {isLoading ? "Redirecting..." : "Subscribe Now"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
