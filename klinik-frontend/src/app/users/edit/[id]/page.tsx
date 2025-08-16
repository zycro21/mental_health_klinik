// app/dashboard/user/edit/[id]/page.tsx
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

export default function EditUserPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const router = useRouter();

  const [form, setForm] = useState<User>({
    id: "",
    fullName: "",
    email: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    const token = Cookies.get("token");
    api
      .get(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setForm(res.data))
      .catch(() => alert("Gagal memuat data user"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = Cookies.get("token");
      const payload = {
        fullName: form.fullName,
        email: form.email,
        role: form.role,
      };

      await api.put(`/api/users/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("User berhasil diperbarui");

      // balik ke list user + refresh datanya
      router.replace("/dashboard/user");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Gagal mengupdate user");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6">Memuat data...</p>;

  return (
    <div className="p-6 flex justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Edit User</h1>
          <button
            type="button"
            onClick={() => router.push("/dashboard/user")}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            Kembali ke Daftar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nama Lengkap
            </label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Nama Lengkap"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Pilih Role</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.push("/dashboard/user")}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition-colors"
              disabled={saving}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
