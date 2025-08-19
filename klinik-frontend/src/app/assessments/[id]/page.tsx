// app/assessments/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/lib/axios";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

interface PatientMini {
  id: string;
  fullName: string;
  gender: string;
  birthDate: string;
}

interface Prediction {
  id: string;
  assessmentID: string;
  resultLabel: string;
  probabilityScore: number;
}

interface Assessment {
  id: string;
  patientID: string;
  date: string;
  answers: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  patient: PatientMini;
  prediction?: Prediction;
}

export default function AssessmentDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const token = Cookies.get("token");
        const res = await api.get(`/api/assessments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAssessment(res.data.data);
      } catch (error) {
        console.error("Failed to fetch assessment:", error);
        setAssessment(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAssessment();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
      </div>
    );

  if (!assessment)
    return (
      <p className="text-center text-red-500 font-semibold">
        Assessment not found.
      </p>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 max-w-3xl mx-auto space-y-6"
    >
      <h1 className="text-3xl font-bold text-indigo-700 mb-4 text-center">
        📝 Assessment Detail
      </h1>

      {/* Patient Info */}
      <Card className="shadow-lg border-indigo-200">
        <CardHeader>
          <CardTitle className="text-indigo-600">👤 Patient Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Name:</strong> {assessment.patient.fullName}
          </p>
          <p>
            <strong>Gender:</strong>{" "}
            <Badge variant="outline" className="ml-1">
              {assessment.patient.gender}
            </Badge>
          </p>
          <p>
            <strong>Birth Date:</strong> {assessment.patient.birthDate}
          </p>
        </CardContent>
      </Card>

      {/* Assessment Info */}
      <Card className="shadow-lg border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-600">📅 Assessment Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Date:</strong> {new Date(assessment.date).toLocaleString()}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {new Date(assessment.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Updated At:</strong>{" "}
            {new Date(assessment.updatedAt).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Answers */}
      <Card className="shadow-lg border-green-200">
        <CardHeader>
          <CardTitle className="text-green-600">✅ Answers</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {Object.entries(assessment.answers).map(([q, a], idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-2 rounded-md bg-green-50 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>
                  <strong>{q}:</strong> {String(a)}
                </span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Prediction */}
      {assessment.prediction && (
        <Card className="shadow-lg border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-600">🔮 Prediction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Label:</strong>{" "}
              <Badge className="bg-orange-500 text-white">
                {assessment.prediction.resultLabel}
              </Badge>
            </p>
            <p>
              <strong>Score:</strong>{" "}
              {(assessment.prediction.probabilityScore * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button
          onClick={() => router.push("/dashboard/assessment")}
          className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Assessments
        </Button>
      </div>
    </motion.div>
  );
}
