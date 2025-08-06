'use client'

import { motion } from 'framer-motion'
import { FaUser, FaProcedures, FaCalendarAlt, FaBrain, FaNotesMedical } from 'react-icons/fa'

const menuItems = [
  { name: 'User', icon: <FaUser /> },
  { name: 'Patient', icon: <FaProcedures /> },
  { name: 'Appointment', icon: <FaCalendarAlt /> },
  { name: 'Assessment', icon: <FaBrain /> },
  { name: 'Prediction', icon: <FaBrain /> },
  { name: 'Medical Record', icon: <FaNotesMedical /> },
]

export default function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-64 bg-blue-200 text-blue-900 p-6 h-screen shadow-lg fixed"
    >
      <h2 className="text-2xl font-semibold mb-6">Menu</h2>
      <ul className="space-y-4">
        {menuItems.map((item, idx) => (
          <li key={idx} className="flex items-center space-x-2 hover:text-blue-600 cursor-pointer">
            <span className="text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </li>
        ))}
      </ul>
    </motion.aside>
  )
}