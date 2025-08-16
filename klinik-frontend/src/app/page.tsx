'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import Hero from '@/components/Hero'
import Sidebar from '@/components/Sidebar'
import InfoCards from '@/components/InfoCards'
import Footer from '@/components/Footer'
import MentalHealthStats from '@/components/MentalHealthStats'
import EducationalSection from '@/components/EducationalSection'
import DailyTips from '@/components/DailyTips'
import SupportResources from '@/components/SupportResources'
import MentalHealthChart from '@/components/MentalHealthChart'

export default function HomePage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) {
      router.push('/login')
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  if (!isAuthenticated) return null

  return (
    <div className="flex">
      <Sidebar onToggle={setSidebarCollapsed} />
      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        } flex-1 p-8 bg-blue-50 min-h-screen`}
      >
        <Hero />
        <InfoCards />
        <MentalHealthStats />
        <MentalHealthChart />
        <EducationalSection />
        <DailyTips />
        <SupportResources />
        <Footer />
      </main>
    </div>
  )
}
