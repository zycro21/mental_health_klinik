"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import Cookies from "js-cookie";

interface Appointment {
  id: string;
  patientId: string;
  userId: string;
  scheduleAt: string;
  status: string;
  notes: string;
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

interface Patient {
  id: string;
  fullName: string;
}

interface User {
  id: string;
  fullName: string;
  role: string;
}

export default function EditAppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: appointmentId } = React.use(params); // ✅ unwrap params Promise

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    patientId: "",
    userId: "",
    scheduleAt: "",
    status: "pending",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch appointment data
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const token = Cookies.get("token");
        const res = await api.get(`/api/appointments/${appointmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointment(res.data);
        setFormData({
          patientId: res.data.patientId,
          userId: res.data.userId,
          scheduleAt: new Date(res.data.scheduleAt).toISOString().slice(0, 16),
          status: res.data.status,
          notes: res.data.notes,
        });
      } catch (err) {
        console.error("Failed to fetch appointment", err);
        alert("Failed to load appointment data");
        router.push("/appointments");
      }
    };
    fetchAppointment();
  }, [appointmentId, router]);

  // Fetch patients and doctors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");

        // Fetch patients
        const patientsRes = await api.get("/api/patients/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(patientsRes.data.data || []);

        // Fetch doctors
        const doctorsRes = await api.get("/api/users/", {
          headers: { Authorization: `Bearer ${token}` },
          params: { role: "doctor" },
        });
        setDoctors(doctorsRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = Cookies.get("token");

      // Update basic appointment info
      await api.put(
        `/api/appointments/${appointmentId}`,
        {
          scheduleAt: new Date(formData.scheduleAt).toISOString(),
          notes: formData.notes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update status if changed
      if (formData.status !== appointment?.status) {
        await api.patch(
          `/api/appointments/${appointmentId}/statusAppoinment`,
          { status: formData.status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      alert("Appointment updated successfully!");
      router.push("/dashboard/appointment");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to update appointment");
    } finally {
      setLoading(false);
    }
  };

  if (!appointment) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Edit Appointment</h1>
        <p>Loading appointment data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Edit Appointment</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Patient Info (read-only) */}
        <div>
          <label className="block text-sm font-medium mb-1">Patient</label>
          <input
            type="text"
            value={appointment.patient.fullName}
            readOnly
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        {/* Doctor Info (read-only) */}
        <div>
          <label className="block text-sm font-medium mb-1">Doctor</label>
          <input
            type="text"
            value={`${appointment.user.fullName} (${appointment.user.role})`}
            readOnly
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        {/* Schedule */}
        <div>
          <label className="block text-sm font-medium mb-1">Schedule At</label>
          <input
            type="datetime-local"
            name="scheduleAt"
            value={formData.scheduleAt}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="pending">Pending</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={4}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {loading ? "Updating..." : "Update Appointment"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/appointment")}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
