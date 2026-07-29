import { cookies } from "next/headers";

async function fetchAllSessions(cookieHeader: string) {
  try {
    const res = await fetch("http://127.0.0.1:5002/api/v1/sessions/admin/all", {
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.data?.sessions || [];
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
}

interface AdminSessionsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminSessionsPage(props: AdminSessionsPageProps) {
  const searchParams = await props.searchParams;
  const filterStatus = (searchParams.status as string) || "all";

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const allSessions = await fetchAllSessions(cookieHeader);

  const filteredSessions = filterStatus === "all"
    ? allSessions
    : allSessions.filter((s: any) => s.status === filterStatus);

  return (
    <div className="min-h-screen bg-[#F8F9FE] w-full">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1236]">Sessions</h1>
            <p className="mt-2 text-sm text-[#4A5568]">
              All skill exchange sessions across the platform.
            </p>
          </div>

          <div className="mt-4 sm:mt-0">
            <form className="flex gap-2" action="/admin/sessions" method="GET">
              <select
                name="status"
                defaultValue={filterStatus}
                className="px-4 py-2 border border-[#E2E8F0] bg-white rounded-lg shadow-sm text-sm text-[#0D1236] focus:outline-none focus:ring-2 focus:ring-[#2A367E]/20 focus:border-[#2A367E] transition"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-[#F4A261] hover:bg-[#e28f4f] px-5 py-2 text-sm font-bold text-white shadow-sm transition"
              >
                Filter
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-[#4A5568] font-medium">Requester</th>
                  <th className="text-left py-3 px-4 text-[#4A5568] font-medium">Provider</th>
                  <th className="text-left py-3 px-4 text-[#4A5568] font-medium">Scheduled At</th>
                  <th className="text-left py-3 px-4 text-[#4A5568] font-medium">Meeting Details</th>
                  <th className="text-left py-3 px-4 text-[#4A5568] font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-[#4A5568] font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No sessions found.
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((session: any) => (
                    <tr key={session._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4 text-[#0D1236]">
                        {session.requesterId?.firstName} {session.requesterId?.lastName}
                        <div className="text-xs text-[#4A5568]">{session.requesterId?.email}</div>
                      </td>
                      <td className="py-3 px-4 text-[#0D1236]">
                        {session.providerId?.firstName} {session.providerId?.lastName}
                        <div className="text-xs text-[#4A5568]">{session.providerId?.email}</div>
                      </td>
                      <td className="py-3 px-4 text-[#4A5568]">
                        {new Date(session.scheduledAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-[#4A5568] max-w-[160px] truncate">
                        {session.meetingDetails || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={session.status} />
                      </td>
                      <td className="py-3 px-4 text-[#4A5568]">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-sm text-[#4A5568]">
          Showing {filteredSessions.length} session{filteredSessions.length !== 1 ? "s" : ""}
          {filterStatus !== "all" && ` with status "${filterStatus}"`}
        </div>
      </div>
    </div>
  );
}
