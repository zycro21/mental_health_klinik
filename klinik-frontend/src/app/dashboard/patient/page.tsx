"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";
import api from "@/lib/axios";

interface Patient {
  id: string;
  fullName: string;
  nik: string;
  birthDate: string;
  gender: string;
  phone: string;
  address: string;
  emergencyContact: string;
}

export default function PatientDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // filters
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState("desc");

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
    if (isAuthenticated) fetchPatients();
  }, [page, search, gender, sort, order, isAuthenticated]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const res = await api.get("/api/patients/", {
        params: { page, limit: 10, search, gender, sort, order },
        headers: { Authorization: `Bearer ${token}` },
      });

      setPatients(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this patient?")) return;
    try {
      const token = Cookies.get("token");
      await api.delete(`/api/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Patient deleted successfully");
      fetchPatients();
    } catch (err) {
      console.error(err);
      alert("Error deleting patient");
    }
  };

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
          Patient Management
        </motion.h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => router.push("/patients/add")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Patient
          </button>
          <input
            type="text"
            placeholder="Search by name or NIK"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-blue-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="created_at">Created At</option>
            <option value="full_name">Full Name</option>
            <option value="nik">NIK</option>
          </select>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-200 text-blue-900">
              <tr>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">NIK</th>
                <th className="py-3 px-4">Birth Date</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">Emergency Contact</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-blue-500">
                    Loading patients...
                  </td>
                </tr>
              ) : patients.length > 0 ? (
                patients.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50 transition-colors">
                    <td className="py-3 px-4">{p.fullName}</td>
                    <td className="py-3 px-4">{p.nik}</td>
                    <td className="py-3 px-4">{p.birthDate}</td>
                    <td className="py-3 px-4 capitalize">{p.gender}</td>
                    <td className="py-3 px-4">{p.phone}</td>
                    <td className="py-3 px-4">{p.address}</td>
                    <td className="py-3 px-4">{p.emergencyContact}</td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => router.push(`/patients/${p.id}`)}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        View
                      </button>
                      <button
                        onClick={() => router.push(`/patients/edit/${p.id}`)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-gray-500">
                    No patients found
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
