"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import api from "@/lib/axios";
import Sidebar from "@/components/Sidebar";

interface MedicalRecord {
  id: string;
  patientId: string;
  userId: string;
  diagnosis: string;
  treatment: string;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: string;
    fullName: string;
  };
  user?: {
    id: string;
    fullName: string;
    role: string;
  };
}

export default function MedicalRecordDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // filter
  const [patientId, setPatientId] = useState("");
  const [userId, setUserId] = useState("");

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
    if (isAuthenticated) fetchRecords();
  }, [page, patientId, userId, isAuthenticated]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const res = await api.get("/api/medical-records/", {
        params: { page, limit: 10, patientId, userId },
        headers: { Authorization: `Bearer ${token}` },
      });

      setRecords(Array.isArray(res.data.data) ? res.data.data : []);
      setTotalPages(res.data.totalPages ?? 1);
    } catch (error) {
      console.error(error);
      setRecords([]);
    } finally {
      setLoading(false);
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
          Medical Records Dashboard
        </motion.h1>

        {/* Filters + Add button */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <button
            onClick={() => router.push("/mecrec/add")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Record
          </button>

          <input
            type="text"
            placeholder="Filter by Patient ID"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="border border-blue-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="text"
            placeholder="Filter by User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="border border-blue-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Table */}
        <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-200 text-blue-900">
              <tr>
                <th className="py-3 px-4">Record ID</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Doctor/User</th>
                <th className="py-3 px-4">Diagnosis</th>
                <th className="py-3 px-4">Treatment</th>
                <th className="py-3 px-4">Created At</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-blue-500">
                    Loading records...
                  </td>
                </tr>
              )}

              {!loading &&
                records.length > 0 &&
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-blue-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-sm">{r.id}</td>
                    <td className="py-3 px-4">
                      {r.patient?.fullName || r.patientId}
                    </td>
                    <td className="py-3 px-4">
                      {r.user?.fullName || r.userId}{" "}
                      <span className="text-xs text-gray-500">
                        ({r.user?.role})
                      </span>
                    </td>
                    <td className="py-3 px-4">{r.diagnosis}</td>
                    <td className="py-3 px-4">{r.treatment}</td>
                    <td className="py-3 px-4">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => router.push(`/medical-records/${r.id}`)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        View
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/medical-records/edit/${r.id}`)
                        }
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (
                            confirm(
                              "Are you sure you want to delete this medical record?"
                            )
                          ) {
                            try {
                              const token = Cookies.get("token");
                              await api.delete(`/api/medical-records/${r.id}`, {
                                headers: { Authorization: `Bearer ${token}` },
                              });
                              fetchRecords();
                            } catch (err) {
                              console.error(err);
                              alert("Failed to delete medical record");
                            }
                          }
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

              {!loading && records.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-500">
                    No medical records found
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
