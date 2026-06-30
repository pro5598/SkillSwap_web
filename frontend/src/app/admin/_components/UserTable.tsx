import React from "react";
import Link from "next/link";
import Pagination from "./Pagination";

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface UserTableProps {
  users: User[];
  totalPages: number;
  currentPage: number;
}

export default function UserTable({ users, totalPages, currentPage }: UserTableProps) {
  if (!users || users.length === 0) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-sm p-12 text-center text-[#4A5568]">
        No users found matching your criteria.
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-[#4A5568] uppercase bg-[#F8F9FE] border-b border-[#E2E8F0]">
            <tr>
              <th scope="col" className="px-6 py-4">ID</th>
              <th scope="col" className="px-6 py-4">Username</th>
              <th scope="col" className="px-6 py-4">Email</th>
              <th scope="col" className="px-6 py-4">Role</th>
              <th scope="col" className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="bg-[#FFFFFF] border-b border-[#E2E8F0] hover:bg-[#F8F9FE] transition-colors">
                <td className="px-6 py-4 font-medium text-[#0D1236] truncate max-w-[120px]">
                  {user._id}
                </td>
                <td className="px-6 py-4 text-[#4A5568]">{user.username}</td>
                <td className="px-6 py-4 text-[#4A5568]">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${user.role === 'admin' ? 'bg-[#2A367E]/10 text-[#2A367E]' : 'bg-[#F4A261]/15 text-[#F4A261]'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/admin/users/${user._id}`} className="font-bold text-[#2A367E] hover:text-[#0D1236] mx-2 transition">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#F8F9FE]/50">
          <Pagination totalPages={totalPages} currentPage={currentPage} />
        </div>
      )}
    </div>
  );
}
