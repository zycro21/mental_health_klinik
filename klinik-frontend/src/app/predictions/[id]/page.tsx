"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { motion } from "framer-motion";
import Cookies from "js-cookie";

interface Prediction {
  id: string;
  assessmentId: string;
  resultLabel: string;
  probabilityScore: number;
  createdAt: string;
}

export default function PredictionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const token = Cookies.get("token"); // ambil token dari cookies
        if (!token) {
          setError("Token tidak ditemukan, silakan login ulang.");
          setLoading(false);
          return;
        }

        const res = await api.get(`/api/predictions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPrediction(res.data);
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPrediction();
  }, [id]);

  return (
    <div className="flex min-h-screen bg-blue-50 items-center justify-center p-4">
      {loading && (
        <div className="text-blue-600 text-lg font-semibold">Loading...</div>
      )}
      {error && (
        <div className="text-red-500 font-semibold">Error: {error}</div>
      )}
      {!loading && !error && prediction && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl bg-white shadow-lg rounded-2xl p-6"
        >
          <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
            Detail Prediksi
          </h1>

          <div className="space-y-4 text-gray-700">
            <div>
              <span className="font-semibold text-blue-600">Prediction ID:</span>{" "}
              {prediction.id}
            </div>
            <div>
              <span className="font-semibold text-blue-600">Assessment ID:</span>{" "}
              {prediction.assessmentId}
            </div>
            <div>
              <span className="font-semibold text-blue-600">Result Label:</span>{" "}
              {prediction.resultLabel}
            </div>
            <div>
              <span className="font-semibold text-blue-600">
                Probability Score:
              </span>{" "}
              {prediction.probabilityScore.toFixed(4)}
            </div>
            <div>
              <span className="font-semibold text-blue-600">Created At:</span>{" "}
              {new Date(prediction.createdAt).toLocaleString()}
            </div>
          </div>

          {/* Tombol Back */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => router.push("/dashboard/prediction")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              ← Back to Predictions
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
