'use client'

import { usePathname } from 'next/navigation'
import Header from './header'

export default function HeaderWrapper() {
  const pathname = usePathname()
  const isSignUpPage = pathname === '/signup'

  if (isSignUpPage) {
    return null
  }

  return <Header />
}