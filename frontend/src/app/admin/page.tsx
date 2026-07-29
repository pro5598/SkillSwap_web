import { cookies } from "next/headers";
import Link from "next/link";

async function fetchStats(cookieHeader: string) {
  try {
    const res = await fetch("http://127.0.0.1:5002/api/v1/user/admin/stats", {
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return null;
  }
}

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const stats = await fetchStats(cookieHeader);

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, href: "/admin/users", color: "bg-blue-500" },
    { label: "Pending Skills", value: stats?.pendingSkills ?? 0, href: "/admin/skills", color: "bg-amber-500" },
    { label: "Total Skills", value: stats?.totalSkills ?? 0, href: "/admin/skills", color: "bg-green-500" },
    { label: "Swap Requests", value: stats?.totalSwapRequests ?? 0, href: "/admin/swap-requests", color: "bg-orange-500" },
    { label: "Sessions", value: stats?.totalSessions ?? 0, href: "/admin/sessions", color: "bg-teal-500" },
  ];

  const swapByStatus = (stats?.swapRequestsByStatus || []).reduce(
    (acc: Record<string, number>, item: { _id: string; count: number }) => {
      acc[item._id] = item.count;
      return acc;
    },
    {}
  );

  const sessionsByStatus = (stats?.sessionsByStatus || []).reduce(
    (acc: Record<string, number>, item: { _id: string; count: number }) => {
      acc[item._id] = item.count;
      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen bg-[#F8F9FE] w-full">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0D1236]">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-[#4A5568]">Overview of platform activity and statistics.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((card) => (
            <Link key={card.label} href={card.href} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center mb-3`}>
                <span className="text-white font-bold text-lg">{card.value}</span>
              </div>
              <p className="text-sm font-medium text-[#4A5568]">{card.label}</p>
            </Link>
          ))}
        </div>

        {/* Status Breakdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#0D1236] mb-4">Swap Requests by Status</h2>
            <div className="space-y-3">
              {["pending", "accepted", "declined", "cancelled"].map((status) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm text-[#4A5568] capitalize">{status}</span>
                  <span className="text-sm font-semibold text-[#0D1236]">{swapByStatus[status] || 0}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#0D1236] mb-4">Sessions by Status</h2>
            <div className="space-y-3">
              {["pending", "accepted", "completed", "cancelled"].map((status) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm text-[#4A5568] capitalize">{status}</span>
                  <span className="text-sm font-semibold text-[#0D1236]">{sessionsByStatus[status] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Users */}
        {stats?.recentUsers && stats.recentUsers.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#0D1236]">Recent Users</h2>
              <Link href="/admin/users" className="text-sm text-[#2A367E] hover:underline">View all</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-[#4A5568] font-medium">Name</th>
                    <th className="text-left py-2 px-3 text-[#4A5568] font-medium">Email</th>
                    <th className="text-left py-2 px-3 text-[#4A5568] font-medium">Role</th>
                    <th className="text-left py-2 px-3 text-[#4A5568] font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers.map((u: any) => (
                    <tr key={u._id} className="border-b border-gray-50">
                      <td className="py-2 px-3 text-[#0D1236]">{u.firstName} {u.lastName}</td>
                      <td className="py-2 px-3 text-[#4A5568]">{u.email}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[#4A5568]">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
