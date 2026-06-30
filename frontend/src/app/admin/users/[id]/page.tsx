import React from "react";
import UserForm from "../../_components/UserForm";
import Link from "next/link";
import { cookies } from "next/headers";

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

async function fetchUser(id: string, cookieHeader: string) {
  try {
    const res = await fetch(`http://127.0.0.1:5000/api/v1/user/admin/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Failed to fetch user: ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data.data?.user || null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export default async function EditUserPage(props: EditUserPageProps) {
  const params = await props.params;
  const { id } = params;

  // Get cookies to pass to the backend for authentication
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  // Fetch the user data
  const user = await fetchUser(id, cookieHeader);

  return (
    <div className="min-h-screen bg-[#F8F9FE] w-full">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/admin/users" className="text-[#2A367E] hover:underline text-sm font-bold flex items-center gap-1 mb-4">
            &larr; Back to Users
          </Link>
          <h1 className="text-2xl font-bold text-[#0D1236]">Edit User</h1>
          <p className="mt-1 text-sm text-[#4A5568]">
            Update the user's details or remove them entirely from the system.
          </p>
        </div>
        
        {user ? (
          <UserForm initialData={user} isEditing={true} />
        ) : (
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-sm p-12 text-center text-red-500 font-bold">
            Failed to load user. They may have been deleted, or you may not be authenticated.
          </div>
        )}
      </div>
    </div>
  );
}
