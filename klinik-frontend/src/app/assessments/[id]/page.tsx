// app/assessments/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";

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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/assessments/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch assessment");
        }

        const data = await res.json();
        setAssessment(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAssessment();
  }, [id]);

  if (loading) return <p className="text-center">Loading...</p>;
  if (!assessment) return <p className="text-center">Assessment not found.</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Assessment Detail</h1>

      {/* Patient Info */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Patient</h2>
        <p>
          <strong>Name:</strong> {assessment.patient.fullName}
        </p>
        <p>
          <strong>Gender:</strong> {assessment.patient.gender}
        </p>
        <p>
          <strong>Birth Date:</strong> {assessment.patient.birthDate}
        </p>
      </div>

      {/* Assessment Info */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Assessment</h2>
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
      </div>

      {/* Answers */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Answers</h2>
        <ul className="list-disc ml-6">
          {Object.entries(assessment.answers).map(([q, a], idx) => (
            <li key={idx}>
              <strong>{q}:</strong> {String(a)}
            </li>
          ))}
        </ul>
      </div>

      {/* Prediction (if exists) */}
      {assessment.prediction && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Prediction Result</h2>
          <p>
            <strong>Label:</strong> {assessment.prediction.resultLabel}
          </p>
          <p>
            <strong>Score:</strong> {assessment.prediction.probabilityScore}
          </p>
        </div>
      )}

      <button
        onClick={() => router.push("/assessments")}
        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
      >
        Back
      </button>
    </div>
  );
}
