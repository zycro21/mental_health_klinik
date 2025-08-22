'use client'

import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <motion.footer
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="text-center text-sm text-gray-500 py-4"
    >
      &copy; {new Date().getFullYear()} Mental Klinik Sidoarjo - DP 21
    </motion.footer>
  )
}
