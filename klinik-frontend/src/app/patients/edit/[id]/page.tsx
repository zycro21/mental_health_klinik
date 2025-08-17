"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/lib/axios";

interface Patient {
  fullName: string;
  nik: string;
  birthDate: string;
  gender: string;
  phone: string;
  address: string;
  emergencyContact: string;
}

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [form, setForm] = useState<Patient>({
    fullName: "",
    nik: "",
    birthDate: "",
    gender: "",
    phone: "",
    address: "",
    emergencyContact: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const token = Cookies.get("token");
        const res = await api.get(`/api/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm({
          fullName: res.data.fullName || "",
          nik: res.data.nik || "",
          birthDate: res.data.birthDate || "",
          gender: res.data.gender || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
          emergencyContact: res.data.emergencyContact || "",
        });
      } catch (err) {
        console.error(err);
        alert("Gagal mengambil data pasien");
        router.push("/dashboard/patient");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPatient();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = Cookies.get("token");
      await api.put(`/api/patients/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Patient updated successfully");
      router.push("/dashboard/patient");
    } catch (err) {
      console.error(err);
      alert("Failed to update patient");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Patient</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* NIK */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NIK
            </label>
            <input
              type="text"
              value={form.nik}
              onChange={(e) => setForm({ ...form, nik: e.target.value })}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birth Date
            </label>
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Emergency Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Emergency Contact
            </label>
            <input
              type="text"
              value={form.emergencyContact}
              onChange={(e) =>
                setForm({ ...form, emergencyContact: e.target.value })
              }
              className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
            >
              Update Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
