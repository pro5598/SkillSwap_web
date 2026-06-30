"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "@/api/axios";

// Form schema based on CreateUserDTO and UpdateUserDTO
const userFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Must be at least 3 characters").max(30),
  phoneNumber: z.string().min(10, "Must be at least 10 digits"),
  role: z.enum(["admin", "user"]),
  password: z.string().optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function UserForm({ initialData, isEditing = false }: UserFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      username: initialData?.username || "",
      phoneNumber: initialData?.phoneNumber || "",
      role: initialData?.role || "user",
      password: "", // Password is blank initially
    },
  });

  const onSubmit = async (data: UserFormData) => {
    setServerError("");
    setSuccessMessage("");
    try {
      if (isEditing) {
        // If editing, only send newPassword if they typed something
        const updateData: any = { ...data };
        if (updateData.password) {
          updateData.newPassword = updateData.password;
        }
        delete updateData.password;
        if (!updateData.newPassword) delete updateData.newPassword;

        await axiosInstance.put(`/user/admin/${initialData._id}`, updateData);
        setSuccessMessage("User updated successfully!");
      } else {
        // Create user
        if (!data.password) {
          setServerError("Password is required for new users.");
          return;
        }
        await axiosInstance.post("/user/admin/create", data);
        setSuccessMessage("User created successfully!");
        router.push("/admin/users");
        return;
      }
      
      router.refresh(); // Refresh page data
    } catch (error: any) {
      setServerError(error.response?.data?.message || "An error occurred");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await axiosInstance.delete(`/user/admin/${initialData._id}`);
      router.push("/admin/users");
      router.refresh();
    } catch (error: any) {
      setServerError(error.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-sm p-8">
      {serverError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
          {serverError}
        </div>
      )}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-[#0D1236] mb-1">First Name</label>
            <input
              {...register("firstName")}
              className="w-full border border-[#E2E8F0] p-2.5 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] focus:outline-none focus:ring-2 focus:ring-[#2A367E]/20 focus:border-[#2A367E]"
            />
            {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0D1236] mb-1">Last Name</label>
            <input
              {...register("lastName")}
              className="w-full border border-[#E2E8F0] p-2.5 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] focus:outline-none focus:ring-2 focus:ring-[#2A367E]/20 focus:border-[#2A367E]"
            />
            {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0D1236] mb-1">Username</label>
            <input
              {...register("username")}
              className="w-full border border-[#E2E8F0] p-2.5 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] focus:outline-none focus:ring-2 focus:ring-[#2A367E]/20 focus:border-[#2A367E]"
            />
            {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0D1236] mb-1">Email</label>
            <input
              type="email"
              {...register("email")}
              className="w-full border border-[#E2E8F0] p-2.5 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] focus:outline-none focus:ring-2 focus:ring-[#2A367E]/20 focus:border-[#2A367E]"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0D1236] mb-1">Phone Number</label>
            <input
              {...register("phoneNumber")}
              className="w-full border border-[#E2E8F0] p-2.5 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] focus:outline-none focus:ring-2 focus:ring-[#2A367E]/20 focus:border-[#2A367E]"
            />
            {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0D1236] mb-1">Role</label>
            <select
              {...register("role")}
              className="w-full border border-[#E2E8F0] p-2.5 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] focus:outline-none focus:ring-2 focus:ring-[#2A367E]/20 focus:border-[#2A367E]"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-[#0D1236] mb-1">
              {isEditing ? "New Password (leave blank to keep current)" : "Password"}
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full border border-[#E2E8F0] p-2.5 rounded-lg text-sm bg-[#F8F9FE] text-[#0D1236] focus:outline-none focus:ring-2 focus:ring-[#2A367E]/20 focus:border-[#2A367E]"
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>
        </div>

        <div className="flex justify-between border-t border-[#E2E8F0] pt-6 mt-8">
          {isEditing ? (
            <button
              type="button"
              onClick={handleDelete}
              className="px-5 py-2.5 text-sm font-bold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition"
            >
              Delete User
            </button>
          ) : (
            <div></div> /* Spacer */
          )}
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/users")}
              className="px-5 py-2.5 text-sm font-bold rounded-lg bg-white text-[#4A5568] hover:bg-[#F8F9FE] border border-[#E2E8F0] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-bold rounded-lg bg-[#F4A261] hover:bg-[#e28f4f] text-white disabled:opacity-70 transition"
            >
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create User"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
