'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Header() {
	const [isOpen, setIsOpen] = useState(false)
	const [hasScrolled, setHasScrolled] = useState(false)

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

	return (
		<nav className={`sticky top-0 z-50 transition-all duration-300 ${hasScrolled ? 'bg-gray-900 bg-opacity-80 backdrop-blur-md' : 'bg-transparent'}`} id="navbar">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-20"> {/* Increased height and centered items */}
					<div className="flex-shrink-0 absolute left-[15%] flex items-center"> {/* Centered logo vertically */}
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
						<Link href="/login" className="text-white hover:text-yellow-400">Login</Link>
						<Link href="/signup" className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Signup</Link>
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
						<Link href="/login" className="block py-2 text-white hover:text-yellow-400">Login</Link>
						<Link href="/signup" className="block py-2 text-white hover:text-yellow-400">Signup</Link>
					</div>
				)}
			</div>
		</nav>
	)
}