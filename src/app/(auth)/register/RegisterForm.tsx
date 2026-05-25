"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormData } from "./schema";
import Link from "next/link";

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert(`Account created for: ${data.username}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#0D1236] mb-1">
            First Name
          </label>
          <input
            type="text"
            className={`w-full border p-2.5 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] outline-none transition ${
              errors.firstName
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
            className={`w-full border p-2.5 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] outline-none transition ${
              errors.lastName
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
          className={`w-full border p-2.5 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] outline-none transition ${
            errors.username
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
          className={`w-full border p-2.5 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] outline-none transition ${
            errors.email
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
          Password
        </label>
        <input
          type="password"
          className={`w-full border p-2.5 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] outline-none transition ${
            errors.password
              ? "border-red-500"
              : "border-[#E2E8F0] focus:border-[#2A367E]"
          }`}
          placeholder="••••••••"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0D1236] mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          className={`w-full border p-2.5 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] outline-none transition ${
            errors.confirmPassword
              ? "border-red-500"
              : "border-[#E2E8F0] focus:border-[#2A367E]"
          }`}
          placeholder="••••••••"
          {...register("confirmPassword")}
        />
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
  );
}
