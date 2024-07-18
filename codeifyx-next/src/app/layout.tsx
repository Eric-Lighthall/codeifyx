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
      </body>
    </html>
  )
}