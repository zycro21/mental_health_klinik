'use client'

import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <motion.section
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-blue-100 text-blue-900 p-8 rounded-lg shadow mb-8"
    >
      <h1 className="text-3xl font-bold mb-2">Selamat Datang di Mental Klinik</h1>
      <p className="text-md">
        Temukan layanan kesehatan mental terpercaya dan aman bersama kami.
      </p>
    </motion.section>
  )
}