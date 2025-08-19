"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Cookies from "js-cookie"

interface Appointment {
  id: string
  patientId: string
  userId: string
  scheduleAt: string
  status: string
  notes: string
  createdAt: string
  updatedAt: string
  patient: {
    id: string
    fullName: string
  }
  user: {
    id: string
    fullName: string
    role: string
  }
}

export default function AppointmentDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const token = Cookies.get("token")
        const res = await fetch(`http://localhost:8080/api/appointments/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Failed to fetch appointment")

        const data = await res.json()
        setAppointment(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchAppointment()
  }, [id])

  if (loading) return <p className="text-center py-10">Loading...</p>
  if (!appointment) return <p className="text-center py-10">Appointment not found</p>

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <h1 className="text-2xl font-bold mb-4">Appointment Detail</h1>

      <div className="space-y-3">
        <p><strong>ID:</strong> {appointment.id}</p>
        <p><strong>Patient:</strong> {appointment.patient.fullName}</p>
        <p><strong>Doctor/Staff:</strong> {appointment.user.fullName} ({appointment.user.role})</p>
        <p><strong>Schedule At:</strong> {new Date(appointment.scheduleAt).toLocaleString()}</p>
        <p><strong>Status:</strong> 
          <span className={`ml-2 px-2 py-1 rounded text-white
            ${appointment.status === "pending" ? "bg-yellow-500" : ""}
            ${appointment.status === "done" ? "bg-green-500" : ""}
            ${appointment.status === "cancelled" ? "bg-red-500" : ""}
          `}>
            {appointment.status}
          </span>
        </p>
        <p><strong>Notes:</strong> {appointment.notes || "-"}</p>
        <p><strong>Created At:</strong> {new Date(appointment.createdAt).toLocaleString()}</p>
        <p><strong>Updated At:</strong> {new Date(appointment.updatedAt).toLocaleString()}</p>
      </div>

      <button
        onClick={() => router.push("/dashboard/appointment")}
        className="mt-6 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
      >
        Back to Appointments
      </button>
    </div>
  )
}
