import React from "react";
import UserForm from "../../_components/UserForm";
import Link from "next/link";

export default function CreateUserPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FE] w-full">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/admin/users" className="text-[#2A367E] hover:underline text-sm font-bold flex items-center gap-1 mb-4">
            &larr; Back to Users
          </Link>
          <h1 className="text-2xl font-bold text-[#0D1236]">Create New User</h1>
          <p className="mt-1 text-sm text-[#4A5568]">
            Fill out the form below to add a new user to the system.
          </p>
        </div>
        
        <UserForm />
      </div>
    </div>
  );
}
