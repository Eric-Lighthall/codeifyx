import Image from 'next/image'
import Link from 'next/link'
import TypedText from './components/typed_text';

export default function Home() {
  return (
    <main className="container mx-auto px-4">
      <div className="gradient-container"></div>
      <div className="text-center text-white pt-20 md:pt-16">
        <h1 className="text-5xl font-bold mb-2">A Better Way To</h1>
        <h1 className="text-5xl font-bold mb-8">
          <TypedText />
        </h1>
      </div>
      <div className="text-center mt-8">
        <p className="text-xl text-slightly-gray mb-6">
          Using state of the art AI, Codeifyx makes it easy for anyone to get help with code.
        </p>
        <Link href="/chat" className="btn-warning" id="launch-btn">
          Launch Codeifyx
        </Link>
        <p className="text-sm text-slightly-gray mt-4">No credit card required. Free sign up.</p>
      </div>
      <div className="text-center mt-16">
        <div className="image-container">
          <Image
            src="/images/codeifyxshowcase.png"
            alt="Codeifyx Image"
            width={2113}
            height={1258}
            className="rounded-lg"
          />
        </div>
      </div>
      <div className="container mt-20">
        <div className="text-center">
          <h2 className="headline mb-10">Code Smarter, Not Harder: Explore Top Features of CodeifyX</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <i className="fas fa-code text-5xl mb-4"></i>
            <h3 className="text-2xl font-bold mb-2">Smart Code Completion</h3>
            <p>Accelerate your coding with AI-driven predictions that auto-complete your code intelligently, adapting to your style for tailored recommendations.</p>
          </div>
          <div className="text-center">
            <i className="fas fa-tools text-5xl mb-4"></i>
            <h3 className="text-2xl font-bold mb-2">Code Refactoring Suggestions</h3>
            <p>Enhance your code's structure with AI-powered refactoring tips. Optimize readability and efficiency with smart, automated suggestions.</p>
          </div>
          <div className="text-center">
            <i className="fas fa-code-branch text-5xl mb-4"></i>
            <h3 className="text-2xl font-bold mb-2">Cross-Language Integration</h3>
            <p>Code effortlessly in multiple languages. Get customized support and seamless integration across different programming environments.</p>
          </div>
        </div>
        <div className="text-center my-10">
          <Link href="/demo" className="btn-primary">
            Try a Demo
          </Link>
        </div>
      </div>
    </main>
  )
}