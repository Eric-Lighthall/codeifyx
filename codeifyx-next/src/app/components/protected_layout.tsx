'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })
        
        if (res.ok) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          router.replace(`/login?from=${encodeURIComponent(window.location.pathname)}`)
        }
      } catch (error) {
        console.error('Authentication check failed:', error)
        setIsAuthenticated(false)
        router.replace(`/login?from=${encodeURIComponent(window.location.pathname)}`)
      }
    }

    checkAuth()
  }, [router])

  if (isAuthenticated === null || isAuthenticated === false) {
    return null
  }

  return <>{children}</>
}