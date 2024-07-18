import { getServerSession } from "next-auth/next";
import Link from 'next/link';

export default async function Home() {
  const session = await getServerSession();
  const homeUser = session?.user ? {
    displayName: session.user.name,
    image: session.user.image,
  } : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Welcome to Codeifyx</h1>
      <p className="text-xl mb-8">Your AI-powered coding assistant</p>
      
      {!homeUser ? (
        <div className="space-x-4">
          <Link href="/login" className="btn btn-primary">
            Login
          </Link>
          <Link href="/signup" className="btn btn-secondary">
            Sign Up
          </Link>
        </div>
      ) : (
        <div>
          <p className="mb-4">Welcome back, {homeUser.displayName}!</p>
          <Link href="/chat" className="btn btn-primary">
            Start Coding
          </Link>
        </div>
      )}

      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Features</h2>
        <ul className="list-disc list-inside">
          <li>AI-powered code completion</li>
          <li>Multi-language support</li>
          <li>Real-time collaboration</li>
          <li>Code explanation and optimization</li>
        </ul>
      </section>
    </div>
  );
}