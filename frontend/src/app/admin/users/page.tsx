import React from "react";
import UserTable from "../_components/UserTable";
import { cookies } from "next/headers";

interface AdminUsersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function fetchUsers(cookieHeader: string) {
  try {
    const res = await fetch("http://127.0.0.1:5000/api/v1/user/admin/all", {
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Failed to fetch users: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    return data.data?.users || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export default async function AdminUsersPage(props: AdminUsersPageProps) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page as string) || 1;
  const size = parseInt(searchParams.size as string) || 10;
  const search = (searchParams.search as string) || "";

  // Get cookies to pass to the backend for authentication
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  // API Call - Fetches users
  const allUsers = await fetchUsers(cookieHeader);

  // Apply search filter if present (fallback since backend doesn't handle search currently)
  let filteredUsers = allUsers;
  if (search) {
    const searchLower = search.toLowerCase();
    filteredUsers = allUsers.filter(
      (user: any) =>
        user.username?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.role?.toLowerCase().includes(searchLower)
    );
  }

  // Calculate pagination
  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  
  // Apply pagination slicing
  const startIndex = (page - 1) * size;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + size);

  return (
    <div className="min-h-screen bg-[#F8F9FE] w-full">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1236]">User Management</h1>
            <p className="mt-2 text-sm text-[#4A5568]">
              A list of all users in your account including their name, email, and role.
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex gap-2">
            {/* Simple search form that uses native form submission to update URL params */}
            <form className="flex gap-2" action="/admin/users" method="GET">
              <input 
                type="hidden" 
                name="size" 
                value={size} 
              />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search users..."
                className="px-4 py-2 border border-[#E2E8F0] bg-white rounded-lg shadow-sm text-sm text-[#0D1236] focus:outline-none focus:ring-2 focus:ring-[#2A367E]/20 focus:border-[#2A367E] transition"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-[#F4A261] hover:bg-[#e28f4f] px-5 py-2 text-sm font-bold text-white shadow-sm focus:outline-none transition sm:w-auto"
              >
                Search
              </button>
            </form>
            <a
              href="/admin/users/create"
              className="inline-flex items-center justify-center rounded-lg bg-[#2A367E] hover:bg-[#1a2253] px-5 py-2 text-sm font-bold text-white shadow-sm focus:outline-none transition sm:w-auto"
            >
              + Create User
            </a>
          </div>
        </div>

        <UserTable 
          users={paginatedUsers} 
          totalPages={totalPages} 
          currentPage={page} 
        />
      </div>
    </div>
  );
}
