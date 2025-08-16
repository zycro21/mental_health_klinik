'use client'

import { motion } from 'framer-motion'

export default function DailyTips() {
  return (
    <motion.section
      className="bg-white rounded-lg shadow p-6 my-6"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-xl font-semibold mb-4">Tips Harian</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>Luangkan waktu 10 menit untuk meditasi setiap pagi</li>
        <li>Kurangi konsumsi media sosial sebelum tidur</li>
        <li>Berjalan kaki 20 menit di luar ruangan</li>
      </ul>
    </motion.section>
  )
}
