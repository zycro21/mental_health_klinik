"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/lib/axios";

interface Assessment {
  id: string;
  patient: {
    id: string;
    fullName: string;
  };
  prediction?: {
    id: string;
    resultLabel: string;
  } | null;
}

export default function AddPredictionPage() {
  const router = useRouter();
  const [assessmentId, setAssessmentId] = useState("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetch assessments
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const token = Cookies.get("token");
        const res = await api.get("/api/assessments/", {
          params: { limit: 50 },
          headers: { Authorization: `Bearer ${token}` },
        });

        // filter hanya yg prediction null
        const unpredicted = res.data.data.filter((a: Assessment) => !a.prediction);
        setAssessments(unpredicted);
      } catch (err: any) {
        console.error(err);
        setError("Gagal memuat assessment");
      }
    };

    fetchAssessments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentId.trim()) {
      setError("Assessment ID wajib dipilih");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = Cookies.get("token");
      await api.post(`/api/predictions/${assessmentId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      router.push("/dashboard/prediction");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Gagal membuat prediksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-blue-50 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">
          Add Prediction
        </h1>

        {assessments.length === 0 ? (
          <p className="text-gray-600">
            Semua assessment sudah diprediksi ✅
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-blue-800 mb-2">Pilih Assessment</label>
              <select
                value={assessmentId}
                onChange={(e) => setAssessmentId(e.target.value)}
                className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">-- Pilih Assessment --</option>
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} - {a.patient.fullName}
                  </option>
                ))}
              </select>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Create Prediction"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
