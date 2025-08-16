// src/components/MentalHealthChart.tsx
'use client'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { motion } from 'framer-motion'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const data = {
  labels: ['Stress', 'Cemas', 'Depresi', 'Panik', 'Insomnia'],
  datasets: [
    {
      label: 'Jumlah Kasus',
      data: [40, 25, 30, 10, 20],
      backgroundColor: 'rgba(59, 130, 246, 0.6)', // biru soft
      borderRadius: 5,
    },
  ],
}

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Statistik Kesehatan Mental',
    },
  },
}

export default function MentalHealthChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-white rounded-lg shadow-md p-6 mt-8"
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Statistik Kondisi Mental</h2>
      <Bar data={data} options={options} />
    </motion.div>
  )
}
