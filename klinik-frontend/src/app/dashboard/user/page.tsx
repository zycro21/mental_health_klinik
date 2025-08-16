"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";
import api from "@/lib/axios";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function UsersDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) fetchUsers();
  }, [page, search, role, isAuthenticated]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const res = await api.get("/api/users/", {
        params: {
          page,
          limit: 10,
          search,
          role,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = Cookies.get("token");
      await api.delete(`/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("User deleted successfully");
      fetchUsers(); // refresh list
    } catch (err) {
      console.error(err);
      alert("Error deleting user");
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
          User Management
        </motion.h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-blue-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-200 text-blue-900">
              <tr>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-blue-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="py-3 px-4">{user.fullName}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">{user.role}</td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => router.push(`/users/${user.id}`)}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        View
                      </button>
                      <button
                        onClick={() => router.push(`/users/edit/${user.id}`)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    No users found
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
