'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<nav className="bg-transparent sticky top-0 z-50 transition-all duration-300" id="navbar">
			<div className="container mx-auto px-4">
				<div className="flex justify-between items-center py-4">
					<Link href="/" className="flex-shrink-0">
						<Image src="/images/codeifyxlogo3.webp" alt="Codeifyx Logo" width={50} height={50} className="h-12 w-auto" />
					</Link>
					<div className="hidden md:flex space-x-8">
						<Link href="/" className="text-white hover:text-yellow-400">Home</Link>
						<Link href="/chat" className="text-white hover:text-yellow-400">Chat</Link>
						<Link href="/pricing" className="text-white hover:text-yellow-400">Pricing</Link>
						<Link href="/contact" className="text-white hover:text-yellow-400">Contact</Link>
					</div>
					<div className="hidden md:flex items-center space-x-4">
						<Link href="/login" className="text-white hover:text-yellow-400">Login</Link>
						<Link href="/signup" className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Signup</Link>
					</div>
					<button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
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