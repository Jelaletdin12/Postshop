"use client"

import { useState, useEffect } from "react"

interface User {
  first_name: string
  last_name: string
  phone: string
  email?: string
}

interface ProfileContentProps {
  locale: string
}

export default function ProfilePageContent({ locale }: ProfileContentProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const t = {
    profile: "Профиль",
    firstName: "Имя",
    lastName: "Фамилия",
    phone: "Номер телефона",
    email: "Email",
    logout: "Выйти",
    loading: "Загрузка...",
  }

  useEffect(() => {
    const fetchUserData = () => {
      setTimeout(() => {
        setUser({
          first_name: "Иван",
          last_name: "Иванов",
          phone: "+99361234567",
          email: "ivan@example.com",
        })
        setLoading(false)
      }, 500)
    }

    fetchUserData()
  }, [])

  const handleLogout = () => {
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-lg text-gray-600">{t.loading}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">{t.profile}</h1>
        {/* Profile content */}
      </div>
    </div>
  )
}
