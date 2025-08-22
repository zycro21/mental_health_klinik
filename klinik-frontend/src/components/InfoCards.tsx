'use client'

import { motion } from 'framer-motion'

const cards = [
  { title: '51 Pasien Terdaftar', color: 'bg-green-100 text-green-900' },
  { title: '49 Appointment Aktif', color: 'bg-yellow-100 text-yellow-900' },
  { title: '14 Diagnosis Tercatat', color: 'bg-red-100 text-red-900' },
]

export default function InfoCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, idx) => (
        <motion.div
          key={idx}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: idx * 0.2 }}
          className={`p-6 rounded-lg shadow ${card.color}`}
        >
          <h3 className="text-lg font-semibold">{card.title}</h3>
        </motion.div>
      ))}
    </div>
  )
}
