"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";
import api from "@/lib/axios";

interface Appointment {
  id: string;
  patientId: string;
  userId: string;
  scheduleAt: string;
  status: string;
  notes: string;
  patient: {
    id: string;
    fullName: string;
  };
  user: {
    id: string;
    fullName: string;
    role: string;
  };
}

export default function AppointmentDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("schedule_at");
  const [order, setOrder] = useState("asc");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) fetchAppointments();
  }, [page, search, status, sort, order, isAuthenticated]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const res = await api.get("/api/appointments/", {
        params: { page, limit: 10, search, status, sort, order },
        headers: { Authorization: `Bearer ${token}` },
      });

      setAppointments(Array.isArray(res.data.data) ? res.data.data : []);
      setTotalPages(res.data.totalPages ?? 1);
    } catch (error) {
      console.error(error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;
    
    try {
      const token = Cookies.get("token");
      await api.delete(`/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Appointment deleted successfully");
      fetchAppointments(); // Refresh the list after deletion
    } catch (error) {
      console.error("Failed to delete appointment:", error);
      alert("Failed to delete appointment");
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar onToggle={setSidebarCollapsed} />

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        } flex-1 p-8 bg-blue-50 min-h-screen`}
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-blue-900 mb-6"
        >
          Appointment Management
        </motion.h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => router.push("/appointments/add")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Appointment
          </button>
          <input
            type="text"
            placeholder="Search by patient name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-blue-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="schedule_at">Schedule</option>
            <option value="created_at">Created At</option>
          </select>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-200 text-blue-900">
              <tr>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Doctor/Staff</th>
                <th className="py-3 px-4">Schedule At</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-blue-500">
                    Loading appointments...
                  </td>
                </tr>
              ) : appointments.length > 0 ? (
                appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-blue-50 transition-colors">
                    <td className="py-3 px-4">{a.patient.fullName}</td>
                    <td className="py-3 px-4">
                      {a.user.fullName} ({a.user.role})
                    </td>
                    <td className="py-3 px-4">
                      {new Date(a.scheduleAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 capitalize">{a.status}</td>
                    <td className="py-3 px-4">{a.notes}</td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => router.push(`/appointments/${a.id}`)}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        View
                      </button>
                      <button
                        onClick={() => router.push(`/appointments/edit/${a.id}`)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    No appointments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 bg-blue-200 text-blue-900 rounded-lg disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-4 py-2 text-blue-900">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-blue-200 text-blue-900 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
}