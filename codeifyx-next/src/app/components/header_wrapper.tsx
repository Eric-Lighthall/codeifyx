'use client'

import { usePathname } from 'next/navigation'
import Header from './header'

export default function HeaderWrapper() {
  const pathname = usePathname()
  const isAuthPage = pathname === '/signup' || pathname === '/login'

  if (isAuthPage) {
    return null
  }

  return <Header />
}