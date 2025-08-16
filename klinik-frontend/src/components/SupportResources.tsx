'use client'

import { motion } from 'framer-motion'

export default function SupportResources() {
  return (
    <motion.section
      className="bg-white rounded-lg shadow p-6 my-6"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-xl font-semibold mb-4">Sumber Dukungan</h2>
      <ul className="space-y-2">
        <li><a href="https://layananpsikologi.id" target="_blank" className="text-blue-700 hover:underline">Layanan Psikologi Indonesia</a></li>
        <li><a href="https://www.kemenkes.go.id" target="_blank" className="text-blue-700 hover:underline">Kementerian Kesehatan RI</a></li>
        <li><a href="https://www.befrienders.org" target="_blank" className="text-blue-700 hover:underline">Befrienders (Hotline Dunia)</a></li>
      </ul>
    </motion.section>
  )
}
