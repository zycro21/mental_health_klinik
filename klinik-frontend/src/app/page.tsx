'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import Hero from '@/components/Hero'
import Sidebar from '@/components/Sidebar'
import InfoCards from '@/components/InfoCards'
import Footer from '@/components/Footer'

export default function HomePage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

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
      <Sidebar />
      <main className="ml-64 flex-1 p-8 bg-blue-50 min-h-screen">
        <Hero />
        <InfoCards />
        {/* Kamu bisa tambahkan section konten utama di sini */}
        <Footer />
      </main>
    </div>
  )
}
