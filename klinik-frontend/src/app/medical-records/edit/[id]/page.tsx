// app/medical-records/edit/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/axios";
import Cookies from "js-cookie";
import { motion } from "framer-motion";

interface MedicalRecord {
  id: string;
  patientId: string;
  userId: string;
  diagnosis: string;
  treatment: string;
}

export default function EditMedicalRecordPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [form, setForm] = useState<MedicalRecord>({
    id: "",
    patientId: "",
    userId: "",
    diagnosis: "",
    treatment: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!id || !token) return;

    api
      .get(`/api/medical-records/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setForm(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get("token");
    try {
      setSubmitting(true);
      await api.put(`/api/medical-records/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Medical record updated successfully!");
      router.push("/dashboard/mecrec");
    } catch (err: any) {
      console.error("Update failed:", err.response?.data || err.message);
      alert("❌ Failed to update record!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-2xl mt-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
        Edit Medical Record
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Patient ID
          </label>
          <input
            type="text"
            name="patientId"
            value={form.patientId}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="Enter patient ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User ID
          </label>
          <input
            type="text"
            name="userId"
            value={form.userId}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="Enter user ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Diagnosis
          </label>
          <textarea
            name="diagnosis"
            value={form.diagnosis}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 h-24 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="Enter diagnosis"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Treatment
          </label>
          <textarea
            name="treatment"
            value={form.treatment}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 h-24 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="Enter treatment"
          />
        </div>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.95 }}
          disabled={submitting}
          className={`w-full py-3 rounded-lg text-white font-semibold transition ${
            submitting
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-md"
          }`}
        >
          {submitting ? "Updating..." : "Update Record"}
        </motion.button>
      </form>
    </motion.div>
  );
}
