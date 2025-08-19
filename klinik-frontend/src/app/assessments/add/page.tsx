"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface Patient {
  id: string;
  fullName: string;
}

export default function AddAssessmentPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState("");
  const [answers, setAnswers] = useState("{}");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // fetch pasien saat page load
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = Cookies.get("token");
        const res = await fetch("http://localhost:8080/api/patients?limit=50", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setPatients(data.data || []);
        } else {
          console.error("Gagal load patients:", data.error);
        }
      } catch (err) {
        console.error("Error fetch patients", err);
      }
    };
    fetchPatients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let parsedAnswers;
      try {
        parsedAnswers = JSON.parse(answers);
      } catch (err) {
        setError("Format answers harus JSON yang valid.");
        setLoading(false);
        return;
      }

      const token = Cookies.get("token");

      const res = await fetch("http://localhost:8080/api/assessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId,
          date,
          answers: parsedAnswers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat assessment");
      }

      alert("Assessment berhasil dibuat");
      router.push("/assessments");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tambah Assessment</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Patient Dropdown */}
        <div>
          <label className="block font-medium mb-1">Pilih Pasien</label>
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          >
            <option value="">-- Pilih Pasien --</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} ({p.id})
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block font-medium mb-1">Tanggal</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        {/* Answers JSON */}
        <div>
          <label className="block font-medium mb-1">Answers (JSON)</label>
          <textarea
            value={answers}
            onChange={(e) => setAnswers(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 font-mono"
            rows={6}
            required
          />
          <small className="text-gray-500">
            Contoh: {'{ "question1": "jawaban A", "question2": "jawaban B" }'}
          </small>
        </div>

        {/* Error */}
        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </div>
  );
}
