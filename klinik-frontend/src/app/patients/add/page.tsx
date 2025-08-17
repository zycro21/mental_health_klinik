"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/lib/axios";

export default function AddPatientPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    nik: "",
    birthDate: "",
    gender: "",
    phone: "",
    address: "",
    emergencyContact: "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = Cookies.get("token");
      await api.post("/api/patients/", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Patient berhasil ditambahkan");
      router.push("/dashboard/patient");
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan patient");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      <h1 className="text-2xl font-bold mb-6 text-blue-900">Add Patient</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2"
          required
        />
        <input
          name="nik"
          placeholder="NIK"
          value={form.nik}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2"
          required
        />
        <input
          type="date"
          name="birthDate"
          value={form.birthDate}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2"
          required
        />
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2"
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2"
        />
        <textarea
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2"
        />
        <input
          name="emergencyContact"
          placeholder="Emergency Contact"
          value={form.emergencyContact}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2"
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Patient"}
        </button>
      </form>
    </div>
  );
}
