import { cookies } from "next/headers";

async function fetchAllSwapRequests(cookieHeader: string) {
  try {
    const res = await fetch("http://127.0.0.1:5002/api/v1/swap-requests/admin/all", {
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.data?.requests || [];
  } catch (error) {
    console.error("Error fetching swap requests:", error);
    return [];
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    declined: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
}

interface AdminSwapRequestsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminSwapRequestsPage(props: AdminSwapRequestsPageProps) {
  const searchParams = await props.searchParams;
  const filterStatus = (searchParams.status as string) || "all";

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const allRequests = await fetchAllSwapRequests(cookieHeader);

  const filteredRequests = filterStatus === "all"
    ? allRequests
    : allRequests.filter((r: any) => r.status === filterStatus);

  return (
    <div className="min-h-screen bg-[#F8F9FE] w-full">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1236]">Swap Requests</h1>
            <p className="mt-2 text-sm text-[#4A5568]">
              All skill swap requests across the platform.
            </p>
          </div>

          <div className="mt-4 sm:mt-0">
            <form className="flex gap-2" action="/admin/swap-requests" method="GET">
              <select
                name="status"
                defaultValue={filterStatus}
                className="px-4 py-2 border border-[#E2E8F0] bg-white rounded-lg shadow-sm text-sm text-[#0D1236] focus:outline-none focus:ring-2 focus:ring-[#2A367E]/20 focus:border-[#2A367E] transition"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
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
                  <th className="text-left py-3 px-4 text-[#4A5568] font-medium">Sender</th>
                  <th className="text-left py-3 px-4 text-[#4A5568] font-medium">Receiver</th>
                  <th className="text-left py-3 px-4 text-[#4A5568] font-medium">Skill Offered</th>
                  <th className="text-left py-3 px-4 text-[#4A5568] font-medium">Skill Wanted</th>
                  <th className="text-left py-3 px-4 text-[#4A5568] font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-[#4A5568] font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No swap requests found.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req: any) => (
                    <tr key={req._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4 text-[#0D1236]">
                        {req.senderId?.firstName} {req.senderId?.lastName}
                      </td>
                      <td className="py-3 px-4 text-[#0D1236]">
                        {req.receiverId?.firstName} {req.receiverId?.lastName}
                      </td>
                      <td className="py-3 px-4 text-[#4A5568]">{req.skillOffered}</td>
                      <td className="py-3 px-4 text-[#4A5568]">{req.skillWanted}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-3 px-4 text-[#4A5568]">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-sm text-[#4A5568]">
          Showing {filteredRequests.length} request{filteredRequests.length !== 1 ? "s" : ""}
          {filterStatus !== "all" && ` with status "${filterStatus}"`}
        </div>
      </div>
    </div>
  );
}
