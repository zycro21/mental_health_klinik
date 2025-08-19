"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import api from "@/lib/axios";
import Sidebar from "@/components/Sidebar";

interface Assessment {
  id: string;
  patient: { id: string; fullName: string };
  date: string;
  answers: Record<string, any>;
  prediction?: {
    id: string;
    assessmentId: string;
    resultLabel: string;
    probabilityScore: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AssessmentDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [patientId, setPatientId] = useState("");
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
    if (isAuthenticated) fetchAssessments();
  }, [page, patientId, isAuthenticated]);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const res = await api.get("/api/assessments", {
        params: { page, limit: 10, patientId },
        headers: { Authorization: `Bearer ${token}` },
      });

      setAssessments(Array.isArray(res.data.data) ? res.data.data : []);
      setTotalPages(res.data.totalPages ?? 1);
    } catch (error) {
      console.error(error);
      setAssessments([]);
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
          Assessment Management
        </motion.h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => router.push("/assessments/add")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Assessment
          </button>
          <input
            type="text"
            placeholder="Filter by Patient ID"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="border border-blue-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Table */}
        <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-200 text-blue-900">
              <tr>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Prediction</th>
                <th className="py-3 px-4">Answers</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-blue-500">
                    Loading assessments...
                  </td>
                </tr>
              ) : assessments.length > 0 ? (
                assessments.map((a) => (
                  <tr key={a.id} className="hover:bg-blue-50 transition-colors">
                    <td className="py-3 px-4">{a.patient.fullName}</td>
                    <td className="py-3 px-4">
                      {new Date(a.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {a.prediction
                        ? `${a.prediction.resultLabel} (${(
                            a.prediction.probabilityScore * 100
                          ).toFixed(1)}%)`
                        : "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      {Object.keys(a.answers).length} answers
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => router.push(`/assessments/${a.id}`)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        View
                      </button>
                      <button
                        onClick={() => router.push(`/assessments/edit/${a.id}`)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">
                    No assessments found
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
