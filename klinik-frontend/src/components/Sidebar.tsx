'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FaUser, FaProcedures, FaCalendarAlt, FaBrain, FaNotesMedical, FaBars, FaClinicMedical } from 'react-icons/fa'
import { motion } from 'framer-motion'

const menuItems = [
  { name: 'User', icon: <FaUser />, href: '/dashboard/user' },
  { name: 'Patient', icon: <FaProcedures />, href: '/dashboard/patient' },
  { name: 'Appointment', icon: <FaCalendarAlt />, href: '/dashboard/appointment' },
  { name: 'Assessment', icon: <FaBrain />, href: '/dashboard/assessment' },
  { name: 'Prediction', icon: <FaBrain />, href: '/dashboard/prediction' },
  { name: 'Medical Record', icon: <FaNotesMedical />, href: '/dashboard/mecrec' },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <motion.aside
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 h-screen bg-blue-100 text-blue-900 shadow-lg z-50 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Header (Logo + Judul + Toggle) */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-blue-200">
        <div className="flex items-center space-x-3">
          <FaClinicMedical className="text-2xl text-blue-600" />
          {isOpen && <span className="text-lg font-bold">Mental Klinik</span>}
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xl text-blue-700 focus:outline-none"
        >
          <FaBars />
        </button>
      </div>

      {/* Menu Items */}
      <ul className="mt-6 space-y-1">
        {menuItems.map((item, idx) => (
          <Link key={idx} href={item.href}>
            <li className="flex items-center px-4 py-3 hover:bg-blue-200 transition-all cursor-pointer">
              <span className="text-lg mr-4">{item.icon}</span>
              {isOpen && <span className="text-sm font-medium">{item.name}</span>}
            </li>
          </Link>
        ))}
      </ul>
    </motion.aside>
  )
}
