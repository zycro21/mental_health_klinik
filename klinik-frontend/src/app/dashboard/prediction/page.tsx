"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import api from "@/lib/axios";
import Sidebar from "@/components/Sidebar";

interface Prediction {
  id: string;
  assessmentId: string;
  resultLabel: string;
  probabilityScore: number;
  createdAt: string;
}

export default function PredictionDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // filter & sorting
  const [resultLabel, setResultLabel] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
    if (isAuthenticated) fetchPredictions();
  }, [page, resultLabel, sortBy, sortOrder, isAuthenticated]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const res = await api.get("/api/predictions/", {
        params: { page, limit: 10, resultLabel, sortBy, sortOrder },
        headers: { Authorization: `Bearer ${token}` },
      });

      setPredictions(Array.isArray(res.data.data) ? res.data.data : []);
      setTotalPages(res.data.totalPages ?? 1);
    } catch (error) {
      console.error(error);
      setPredictions([]);
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
          Predictions Dashboard
        </motion.h1>

        {/* Filters + Add button */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <button
            onClick={() => router.push("/predictions/add")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Prediction
          </button>

          <input
            type="text"
            placeholder="Filter by Result Label"
            value={resultLabel}
            onChange={(e) => setResultLabel(e.target.value)}
            className="border border-blue-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-blue-300 rounded-lg px-4 py-2"
          >
            <option value="created_at">Created At</option>
            <option value="probability_score">Probability Score</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            className="border border-blue-300 rounded-lg px-4 py-2"
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-200 text-blue-900">
              <tr>
                <th className="py-3 px-4">Assessment ID</th>
                <th className="py-3 px-4">Result Label</th>
                <th className="py-3 px-4">Probability Score</th>
                <th className="py-3 px-4">Created At</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-blue-500">
                    Loading predictions...
                  </td>
                </tr>
              )}

              {!loading && predictions.length > 0 &&
                predictions.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50 transition-colors">
                    <td className="py-3 px-4">{p.assessmentId}</td>
                    <td className="py-3 px-4 font-semibold text-blue-800">
                      {p.resultLabel}
                    </td>
                    <td className="py-3 px-4">
                      {(p.probabilityScore * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => router.push(`/predictions/${p.id}`)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        View
                      </button>
                      <button
                        onClick={() => router.push(`/predictions/edit/${p.id}`)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (
                            confirm("Are you sure you want to delete this prediction?")
                          ) {
                            try {
                              const token = Cookies.get("token");
                              await api.delete(`/api/predictions/${p.id}`, {
                                headers: { Authorization: `Bearer ${token}` },
                              });
                              fetchPredictions();
                            } catch (err) {
                              console.error(err);
                              alert("Failed to delete prediction");
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

              {!loading && predictions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">
                    No predictions found
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
