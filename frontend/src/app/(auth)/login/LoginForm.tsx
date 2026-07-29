"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "./schema";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import GuestRoute from "@/components/GuestRoute";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const { login, googleLogin } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      router.push("/dashboard");
    } catch (error: any) {
      setError("root", { message: error.message });
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setGoogleError(null);
      await googleLogin(credentialResponse.credential);
      router.push("/dashboard");
    } catch (error: any) {
      setGoogleError(error.message);
    }
  };

  return (
    <GuestRoute>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {errors.root && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {errors.root.message}
          </div>
        )}
        {googleError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {googleError}
          </div>
        )}
      <div>
        <label className="block text-sm font-semibold text-[#0D1236] mb-1">
          Email Address
        </label>
        <input
          type="email"
          className={`w-full border p-2.5 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] outline-none transition focus:ring-2 ${
            errors.email
              ? "border-red-500 focus:ring-red-100"
              : "border-[#E2E8F0] focus:ring-[#2A367E]/20 focus:border-[#2A367E]"
          }`}
          placeholder="name@domain.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-semibold text-[#0D1236]">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-[#643000] font-medium hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className={`w-full border p-2.5 pr-10 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] outline-none transition focus:ring-2 ${
              errors.password
                ? "border-red-500 focus:ring-red-100"
                : "border-[#E2E8F0] focus:ring-[#2A367E]/20 focus:border-[#2A367E]"
            }`}
            placeholder="••••••••"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#4A5568] hover:text-[#0D1236] transition"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#F4A261] hover:bg-[#e28f4f] disabled:bg-[#F4A261]/60 text-[#FFFFFF] font-bold py-2.5 rounded-lg text-sm transition mt-2 shadow-sm"
      >
        {isSubmitting ? "Signing in..." : "Sign In"}
      </button>

      <div className="flex items-center gap-3 my-2">
        <div className="flex-1 h-px bg-[#E2E8F0]"></div>
        <span className="text-xs text-[#4A5568] font-medium">or</span>
        <div className="flex-1 h-px bg-[#E2E8F0]"></div>
      </div>

      <div className="flex justify-center w-full">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setGoogleError("Google Sign-In failed. Please try again.")}
          use_fedcm_for_prompt={false}
          text="continue_with"
          shape="rectangular"
          width={400}
        />
      </div>

      <p className="text-center text-sm text-[#4A5568] mt-4">
        New to the platform?{" "}
        <Link
          href="/register"
          className="text-[#2A367E] font-bold hover:underline"
        >
          Join SkillSwap
        </Link>
      </p>
    </form>
    </GuestRoute>
  );
}
