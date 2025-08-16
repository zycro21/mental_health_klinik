'use client'

import { motion } from 'framer-motion'

export default function MentalHealthStats() {
  return (
    <motion.section
      className="bg-white rounded-lg shadow p-6 my-6"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-xl font-semibold mb-4">Statistik Kesehatan Mental</h2>
      <p>📊 Grafik atau ringkasan data kondisi pasien dalam seminggu terakhir akan ditampilkan di sini.</p>
      {/* Placeholder chart / ganti nanti pakai Chart.js atau lainnya */}
      <div className="mt-4 h-40 bg-blue-100 rounded"></div>
    </motion.section>
  )
}
