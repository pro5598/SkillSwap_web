"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "./schema";
import Link from "next/link";

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert(`Logging in: ${data.email}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
          <a
            href="#"
            className="text-xs text-[#643000] font-medium hover:underline"
          >
            Forgot Password?
          </a>
        </div>
        <input
          type="password"
          className={`w-full border p-2.5 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] outline-none transition focus:ring-2 ${
            errors.password
              ? "border-red-500 focus:ring-red-100"
              : "border-[#E2E8F0] focus:ring-[#2A367E]/20 focus:border-[#2A367E]"
          }`}
          placeholder="••••••••"
          {...register("password")}
        />
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
  );
}
