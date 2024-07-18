import './globals.css'
import { Inter } from 'next/font/google'
import Header from './components/header'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
	title: 'Codeifyx',
	description: 'AI-powered coding assistant',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<head>
				<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
				<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap" rel="stylesheet" />
				<script src="https://unpkg.com/scrollreveal"></script>
			</head>
			<body className={`${inter.className} bg-gray-900 text-white`}>
				<Header />
				<main className="container mx-auto px-4 mt-6">
					{children}
				</main>
				<script src="https://cdn.jsdelivr.net/npm/typed.js@2.0.12"></script>
				<script dangerouslySetInnerHTML={{
					__html: `
            document.addEventListener('DOMContentLoaded', function () {
              let options = {
                strings: ['Streamline Coding', 'Ease Debugging', 'Enhance Productivity', 'Document Functions', 'Format Code', 'Refine Logic', 'Correct Syntax'],
                typeSpeed: 70,
                backSpeed: 30,
                backDelay: 2000,
                loop: true,
                showCursor: false,
              };
              let typedText = new Typed('#typed-text', options);
            });

            window.addEventListener('scroll', function () {
              var navbar = document.getElementById('navbar');
              var scrollPosition = window.pageYOffset;
              if (scrollPosition > 50) {
                navbar.classList.add('bg-gray-900');
              } else {
                navbar.classList.remove('bg-gray-900');
              }
            });
          `
				}} />
			</body>
		</html>
	)
}