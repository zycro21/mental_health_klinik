'use client'

import { motion } from 'framer-motion'

export default function EducationalSection() {
  return (
    <motion.section
      className="bg-white rounded-lg shadow p-6 my-6"
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-xl font-semibold mb-4">Edukasi Kesehatan Mental</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>Apa itu anxiety dan bagaimana cara mengatasinya</li>
        <li>Perbedaan antara stres dan depresi</li>
        <li>Kapan perlu menemui profesional kesehatan mental</li>
      </ul>
    </motion.section>
  )
}
