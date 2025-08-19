"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Cookies from "js-cookie"
import api from "@/lib/axios"
import { motion } from "framer-motion"

interface Assessment {
  id: string
  date: string
  answers: Record<string, any>
  createdAt: string
  updatedAt: string
  patientId: string
}

export default function EditAssessmentPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [date, setDate] = useState("")
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const token = Cookies.get("token")
        const res = await api.get<{ data: Assessment }>(`/api/assessments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = res.data.data
        setDate(data.date)
        setAnswers(data.answers || {})
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAssessment()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = Cookies.get("token")

      await api.put(
        `/api/assessments/${id}`,
        { date, answers },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      alert("Assessment berhasil diperbarui ✅")
      router.push("/dashboard/assessment")
    } catch (err: any) {
      alert(err.response?.data?.error || err.message)
    }
  }

  if (loading) return <p className="text-center mt-10 text-gray-500">⏳ Loading...</p>
  if (error) return <p className="text-center mt-10 text-red-500">❌ {error}</p>

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto p-8"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          ✏️ Edit Assessment
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tanggal */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tanggal
            </label>
            <input
              type="date"
              value={date ? new Date(date).toISOString().split("T")[0] : ""}
              onChange={(e) => setDate(new Date(e.target.value).toISOString())}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Jawaban */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Jawaban (JSON)
            </label>
            <textarea
              value={JSON.stringify(answers, null, 2)}
              onChange={(e) => {
                try {
                  setAnswers(JSON.parse(e.target.value))
                } catch {
                  // biarkan user ngetik JSON walau invalid
                }
              }}
              rows={8}
              className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
            />
            <p className="text-xs text-gray-500 mt-1">
              Contoh: <code>{`{"q1":"yes","q2":3}`}</code>
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl shadow-md font-semibold hover:bg-blue-700 transition"
          >
            💾 Simpan Perubahan
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  )
}
