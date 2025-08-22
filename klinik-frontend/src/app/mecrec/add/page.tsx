// app/medical-records/add/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";
import Cookies from "js-cookie"; // ✅ ambil token dari cookies
import { jwtDecode } from "jwt-decode";

interface Assessment {
  id: string;
  patientId: string;
  patient: {
    id: string;
    fullName: string;
  };
  prediction?: {
    resultLabel: string;
    probabilityScore: number;
  };
  diagnosis?: string;
  treatment?: string;
}

interface JwtPayload {
  userId: string; // ✅ samain dengan backend
  role: string;
  full_name?: string; // optional kalau backend nggak kirim
}

export default function AddMedicalRecordPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Ambil userId dari JWT token
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      const decoded = jwtDecode<JwtPayload>(token);
      setUserId(decoded.userId); // ✅ bukan decoded.user_id
    }
  }, []);

  // ✅ Fetch assessments
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const token = Cookies.get("token");
        const res = await api.get("/api/assessments/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const filtered = res.data.data.filter(
          (a: any) => !a.diagnosis || !a.treatment
        );
        setAssessments(filtered);
      } catch (err) {
        console.error("Error fetching assessments", err);
      }
    };
    fetchAssessments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ambil objek assessment berdasarkan id yang dipilih
    const selected = assessments.find((a) => a.id === selectedAssessment);

    if (!selected) {
      alert("Please select an assessment");
      return;
    }

    try {
      const token = Cookies.get("token");

      // ✅ Tambahkan log disini
      console.log({
        patientId: selected.patientId,
        userId,
        diagnosis,
        treatment,
      });

      await api.post(
        "/api/medical-records/",
        {
          patientId: selected.patientId,
          userId,
          diagnosis,
          treatment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      alert("Medical record created successfully");
      router.push("/dashboard/mecrec");
    } catch (err: any) {
      console.error(
        "Error creating medical record:",
        err.response?.data || err.message
      );
      alert("Error creating medical record");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -15 }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 p-6"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg"
      >
        <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">
          Add Medical Record
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Dropdown Assessment */}
          <div>
            <Label htmlFor="assessment">Select Assessment</Label>
            <Select onValueChange={setSelectedAssessment}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an assessment" />
              </SelectTrigger>
              <SelectContent>
                {assessments.map((a) => {
                  const missing = [];
                  if (!a.diagnosis) missing.push("Diagnosis");
                  if (!a.treatment) missing.push("Treatment");

                  return (
                    <SelectItem key={a.id} value={a.id}>
                      {a.patient.fullName} - {a.id} (Missing{" "}
                      {missing.join(" & ")})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Input Diagnosis */}
          <div>
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <textarea
              id="diagnosis"
              className="w-full border rounded-lg p-2"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Enter diagnosis"
              required
            />
          </div>

          {/* Input Treatment */}
          <div>
            <Label htmlFor="treatment">Treatment</Label>
            <textarea
              id="treatment"
              className="w-full border rounded-lg p-2"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder="Enter treatment"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Saving..." : "Save Medical Record"}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
}
