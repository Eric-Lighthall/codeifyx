'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Settings } from 'lucide-react'

interface User {
  email: string;
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset
      if (scrollTop > 50) {
        setHasScrolled(true)
      } else {
        setHasScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        if (res.ok) {
          const data: User = await res.json();
          setUserEmail(data.email);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
	try {
	  const res = await fetch('/api/auth/logout', {
		method: 'POST',
		credentials: 'include'
	  });
	  if (res.ok) {
		setUserEmail(null);
      	setIsDropdownOpen(false);
		  window.location.href = '/';
	  } else {
		console.error('Logout failed');
	  }
	} catch (error) {
	  console.error('Logout error:', error);
	}
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${hasScrolled ? 'bg-gray-900 bg-opacity-80 backdrop-blur-md' : 'bg-transparent'}`} id="navbar">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0 absolute left-[15%] flex items-center">
            <Link href="/">
              <Image src="/images/codeifyxlogo3.webp" alt="Codeifyx Logo" width={1253} height={326} className="h-12 w-auto" />
            </Link>
          </div>
          <div className="hidden md:flex justify-center space-x-8 flex-grow">
            <Link href="/" className="text-white hover:text-yellow-400">Home</Link>
            <Link href="/chat" className="text-white hover:text-yellow-400">Chat</Link>
            <Link href="/pricing" className="text-white hover:text-yellow-400">Pricing</Link>
            <Link href="/contact" className="text-white hover:text-yellow-400">Contact</Link>
          </div>
          <div className="hidden md:flex items-center space-x-4 absolute right-[15%]">
            {loading ? null : (
              userEmail ? (
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="text-white hover:text-yellow-400 flex items-center space-x-1"
                  >
                    <span>{userEmail}</span>
                    <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                      <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-white hover:text-yellow-400">Login</Link>
                  <Link href="/signup" className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Signup</Link>
                </>
              )
            )}
          </div>
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden ml-auto">
            <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
        {isOpen && (
          <div className="md:hidden">
            <Link href="/" className="block py-2 text-white hover:text-yellow-400">Home</Link>
            <Link href="/chat" className="block py-2 text-white hover:text-yellow-400">Chat</Link>
            <Link href="/pricing" className="block py-2 text-white hover:text-yellow-400">Pricing</Link>
            <Link href="/contact" className="block py-2 text-white hover:text-yellow-400">Contact</Link>
            {loading ? null : (
              userEmail ? (
                <>
                  <span className="block py-2 text-white">{userEmail}</span>
                  <Link href="/settings" className="flex items-center py-2 text-white hover:text-yellow-400">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                  <button onClick={handleLogout} className="flex items-center w-full py-2 text-white hover:text-yellow-400">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block py-2 text-white hover:text-yellow-400">Login</Link>
                  <Link href="/signup" className="block py-2 text-white hover:text-yellow-400">Signup</Link>
                </>
              )
            )}
          </div>
        )}
      </div>
    </nav>
  )
}