// app/patients/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import Cookies from "js-cookie";

interface Patient {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  birth_date: string;
  address: string;
  created_at: string | null;
  updated_at: string | null;
}

export default function PatientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const token = Cookies.get("token");
        const res = await api.get(`/api/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatient(res.data);
      } catch (err) {
        console.error("Error fetching patient:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPatient();
  }, [id]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "-" : date.toLocaleString();
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!patient) return <p className="text-center mt-10">Patient not found</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-600 text-center">
        Patient Detail
      </h1>

      <div className="bg-blue-50 shadow-lg rounded-xl p-6 space-y-4 border border-blue-200">
        <p>
          <span className="font-semibold text-blue-700">Full Name:</span>{" "}
          {patient.full_name}
        </p>
        <p>
          <span className="font-semibold text-blue-700">Email:</span>{" "}
          {patient.email}
        </p>
        <p>
          <span className="font-semibold text-blue-700">Phone:</span>{" "}
          {patient.phone}
        </p>
        <p>
          <span className="font-semibold text-blue-700">Gender:</span>{" "}
          {patient.gender}
        </p>
        <p>
          <span className="font-semibold text-blue-700">Birth Date:</span>{" "}
          {formatDate(patient.birth_date)}
        </p>
        <p>
          <span className="font-semibold text-blue-700">Address:</span>{" "}
          {patient.address}
        </p>
        <p>
          <span className="font-semibold text-blue-700">Created At:</span>{" "}
          {formatDate(patient.created_at)}
        </p>
        <p>
          <span className="font-semibold text-blue-700">Updated At:</span>{" "}
          {formatDate(patient.updated_at)}
        </p>
      </div>

      <button
        onClick={() => router.push("/dashboard/patient")}
        className="mt-6 px-5 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition"
      >
        ← Back to Patients
      </button>
    </div>
  );
}
