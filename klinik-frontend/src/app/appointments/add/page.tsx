"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import Cookies from "js-cookie";

interface Patient {
  id: string; // ubah dari ID ke id
  fullName: string; // ubah dari FullName ke fullName
}

interface User {
  id: string; // ubah dari ID ke id
  fullName: string; // ubah dari FullName ke fullName
  role: string;
}

export default function AddAppointmentPage() {
  const router = useRouter();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [patientId, setPatientId] = useState("");
  const [userId, setUserId] = useState("");
  const [scheduleAt, setScheduleAt] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = Cookies.get("token"); // ambil dari cookie
        const res = await api.get("/api/patients/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Patients data:", res.data);
        setPatients(res.data.data);
      } catch (err) {
        console.error("Failed to fetch patients", err);
      }
    };
    fetchPatients();
  }, []);

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = Cookies.get("token"); // ambil dari cookie
        const res = await api.get("/api/users/", {
          headers: { Authorization: `Bearer ${token}` },
          params: { role: "doctor" },
        });
        console.log("Doctor data:", res.data);
        setDoctors(res.data.data);
      } catch (err) {
        console.error("Failed to fetch doctors", err);
      }
    };
    fetchDoctors();
  }, []);

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = Cookies.get("token");
      // Convert scheduleAt to ISO string
      const isoDate = new Date(scheduleAt).toISOString();

      await api.post(
        "/api/appointments/",
        {
          patientId,
          userId,
          scheduleAt: isoDate, // Send as ISO string
          notes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Appointment created successfully!");
      router.push("/dashboard/appointment");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to create appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Add Appointment</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Patient Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-1">Patient</label>
          {/* Patient Dropdown */}
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select patient</option>
            {patients?.map?.((p) => (
              <option key={`patient-${p.id}`} value={p.id}>
                {p.id} - {p.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Doctor Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-1">Doctor</label>
          {/* Doctor Dropdown */}
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select doctor</option>
            {doctors?.map?.((d) => (
              <option key={`doctor-${d.id}`} value={d.id}>
                {d.id} - {d.fullName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Schedule At</label>
          <input
            type="datetime-local"
            value={scheduleAt}
            onChange={(e) => setScheduleAt(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Create Appointment"}
        </button>
      </form>
    </div>
  );
}
