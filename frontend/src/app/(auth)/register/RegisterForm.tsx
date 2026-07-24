"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormData } from "./schema";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import GuestRoute from "@/components/GuestRoute";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: authRegister } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      username: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await authRegister(data);
      // Redirect after successful registration
      router.push("/dashboard");
    } catch (error: any) {
      setError("root", { message: error.message });
    }
  };

  return (
    <GuestRoute>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.root && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {errors.root.message}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#0D1236] mb-1">
              First Name
            </label>
            <input
              type="text"
              className={`w-full border p-2.5 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] outline-none transition ${errors.firstName
                  ? "border-red-500"
                  : "border-[#E2E8F0] focus:border-[#2A367E]"
                }`}
              placeholder="Your Firstname"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-xs text-red-500 mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0D1236] mb-1">
              Last Name
            </label>
            <input
              type="text"
              className={`w-full border p-2.5 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] outline-none transition ${errors.lastName
                  ? "border-red-500"
                  : "border-[#E2E8F0] focus:border-[#2A367E]"
                }`}
              placeholder="Your Lastname"
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-xs text-red-500 mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#0D1236] mb-1">
            Username
          </label>
          <input
            type="text"
            className={`w-full border p-2.5 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] outline-none transition ${errors.username
                ? "border-red-500"
                : "border-[#E2E8F0] focus:border-[#2A367E]"
              }`}
            placeholder="abc"
            {...register("username")}
          />
          {errors.username && (
            <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#0D1236] mb-1">
            Email Address
          </label>
          <input
            type="email"
            className={`w-full border p-2.5 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] outline-none transition ${errors.email
                ? "border-red-500"
                : "border-[#E2E8F0] focus:border-[#2A367E]"
              }`}
            placeholder="example@gmail.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#0D1236] mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            className={`w-full border p-2.5 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] outline-none transition ${errors.phoneNumber
                ? "border-red-500"
                : "border-[#E2E8F0] focus:border-[#2A367E]"
              }`}
            placeholder="1234567890"
            {...register("phoneNumber")}
          />
          {errors.phoneNumber && (
            <p className="text-xs text-red-500 mt-1">{errors.phoneNumber.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#0D1236] mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className={`w-full border p-2.5 pr-10 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] outline-none transition ${errors.password
                  ? "border-red-500"
                  : "border-[#E2E8F0] focus:border-[#2A367E]"
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
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#0D1236] mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className={`w-full border p-2.5 pr-10 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] outline-none transition ${errors.confirmPassword
                  ? "border-red-500"
                  : "border-[#E2E8F0] focus:border-[#2A367E]"
                }`}
              placeholder="••••••••"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#4A5568] hover:text-[#0D1236] transition"
            >
              {showConfirmPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#F4A261] hover:bg-[#e28f4f] disabled:bg-[#F4A261]/60 text-[#FFFFFF] font-bold py-2.5 rounded-lg text-sm transition mt-2 shadow-sm"
        >
          {isSubmitting ? "Creating Account..." : "Register Now"}
        </button>

        <p className="text-center text-sm text-[#4A5568] mt-3">
          Already registered?{" "}
          <Link
            href="/login"
            className="text-[#2A367E] font-bold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </form>
    </GuestRoute>
  );
}
