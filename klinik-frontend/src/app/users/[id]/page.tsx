// app/users/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/lib/axios";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // Pastikan id adalah string
  const id = typeof params.id === "string" ? params.id : "";

  useEffect(() => {
    if (!id) return; // jangan fetch kalau id belum ada

    const token = Cookies.get("token");
    api
      .get(`/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setUser(res.data))
      .catch((err) => {
        console.error(err);
        alert("Gagal memuat data user");
      });
  }, [id]);

  if (!user) return <p>Memuat data...</p>;

  return (
    <div className="p-6 flex justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
          Detail User
        </h1>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Nama</p>
            <p className="text-lg font-medium">{user.fullName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                user.role === "admin"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {user.role}
            </span>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => router.push(`/dashboard/user`)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition-colors"
          >
            Kembali
          </button>
          <button
            onClick={() => router.push(`/dashboard/user/edit/${user.id}`)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          >
            Edit User
          </button>
        </div>
      </div>
    </div>
  );
}
