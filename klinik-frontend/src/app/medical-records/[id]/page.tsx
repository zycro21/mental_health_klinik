"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/lib/axios";
import { motion } from "framer-motion";

interface MedicalRecordDetail {
  id: string;
  patientId: string;
  userId: string;
  diagnosis: string;
  treatment: string;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    fullName: string;
  };
  user: {
    id: string;
    fullName: string;
    role: string;
  };
}

export default function MedicalRecordDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<MedicalRecordDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetching pakai gaya seperti fetchRecords
  const fetchRecord = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const res = await api.get(`/api/medical-records/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecord(res.data ?? null);
    } catch (err) {
      console.error("Error fetching medical record:", err);
      setRecord(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchRecord();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );
  }

  if (!record) {
    return (
      <p className="p-6 text-center text-red-600 text-lg font-semibold">
        Medical record not found.
      </p>
    );
  }

  return (
    <motion.div
      className="p-6 max-w-3xl mx-auto bg-white shadow-2xl rounded-2xl border border-blue-200"
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.h1
        className="text-3xl font-bold mb-6 text-blue-700"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        🩺 Medical Record Detail
      </motion.h1>

      <div className="space-y-4 text-gray-700">
        <motion.p whileHover={{ scale: 1.02 }} className="bg-blue-50 p-3 rounded-lg shadow-sm">
          <span className="font-semibold text-blue-700">Patient:</span>{" "}
          {record.patient.fullName} (ID: {record.patient.id})
        </motion.p>
        <motion.p whileHover={{ scale: 1.02 }} className="bg-blue-50 p-3 rounded-lg shadow-sm">
          <span className="font-semibold text-blue-700">Doctor/Staff:</span>{" "}
          {record.user.fullName} ({record.user.role})
        </motion.p>
        <motion.p whileHover={{ scale: 1.02 }} className="bg-blue-50 p-3 rounded-lg shadow-sm">
          <span className="font-semibold text-blue-700">Diagnosis:</span>{" "}
          {record.diagnosis}
        </motion.p>
        <motion.p whileHover={{ scale: 1.02 }} className="bg-blue-50 p-3 rounded-lg shadow-sm">
          <span className="font-semibold text-blue-700">Treatment:</span>{" "}
          {record.treatment}
        </motion.p>
        <motion.p whileHover={{ scale: 1.02 }} className="bg-blue-50 p-3 rounded-lg shadow-sm">
          <span className="font-semibold text-blue-700">Created At:</span>{" "}
          {new Date(record.createdAt).toLocaleString()}
        </motion.p>
        <motion.p whileHover={{ scale: 1.02 }} className="bg-blue-50 p-3 rounded-lg shadow-sm">
          <span className="font-semibold text-blue-700">Last Updated:</span>{" "}
          {new Date(record.updatedAt).toLocaleString()}
        </motion.p>
      </div>

      <div className="mt-8 flex gap-3">
        <motion.button
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.95, rotate: 2 }}
          onClick={() => router.back()}
          className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all"
        >
          ⬅ Back
        </motion.button>
      </div>
    </motion.div>
  );
}
