// app/predictions/edit/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Prediction {
  id: string;
  assessmentId: string;
  resultLabel: string;
  probabilityScore: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function EditPredictionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetch data prediction
  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const token = Cookies.get("token");
        const res = await api.get(`/api/predictions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPrediction(res.data);
      } catch (err: any) {
        setError(err.message || "Gagal mengambil data prediksi");
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, [id]);

  // handle update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prediction) return;

    setSaving(true);
    setError(null);

    try {
      const token = Cookies.get("token");
      await api.put(
        `/api/predictions/${id}`,
        {
          resultLabel: prediction.resultLabel,
          probabilityScore: prediction.probabilityScore,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      router.push(`/predictions/${id}`);
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui prediksi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center text-blue-600">Loading...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;
  if (!prediction)
    return (
      <p className="text-center text-gray-600">Prediksi tidak ditemukan</p>
    );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 px-4">
      <motion.div
        initial={{ opacity: 0, y: 50, rotateX: -15 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-xl"
      >
        <Card className="shadow-2xl rounded-2xl border border-blue-200 bg-white/80 backdrop-blur-md">
          <CardContent className="p-8">
            <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center drop-shadow-sm">
              ✨ Edit Prediction
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                whileHover={{ scale: 1.02, rotateY: 2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Label className="text-blue-600 font-medium">
                  Result Label
                </Label>
                <Input
                  type="text"
                  value={prediction.resultLabel}
                  onChange={(e) =>
                    setPrediction({
                      ...prediction,
                      resultLabel: e.target.value,
                    })
                  }
                  className="mt-1 border-blue-300 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, rotateY: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Label className="text-blue-600 font-medium">
                  Probability Score
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={prediction.probabilityScore}
                  onChange={(e) =>
                    setPrediction({
                      ...prediction,
                      probabilityScore: parseFloat(e.target.value),
                    })
                  }
                  className="mt-1 border-blue-300 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </motion.div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-4 mt-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1"
                >
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
                  >
                    {saving ? "Saving..." : "💾 Save Changes"}
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1"
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/predictions/${id}`)}
                    className="w-full border-blue-400 text-blue-600 hover:bg-blue-100"
                  >
                    ← Cancel
                  </Button>
                </motion.div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
