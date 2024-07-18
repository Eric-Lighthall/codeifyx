import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
	return (
		<main className="container mx-auto px-4">
			<div className="text-center text-white">
				<h1 className="text-4xl font-bold mb-2">A Better Way To</h1>
				<h1 className="text-4xl font-bold mb-8">
					<span id="typed-text"></span>
				</h1>
			</div>
			<div className="text-center">
				<p className="text-xl text-slightly-gray mb-6">
					Using state of the art AI, Codeifyx makes it easy for anyone to get help with code.
				</p>
				<Link href="/chat" className="btn btn-warning btn-lg text-white text-lg px-6 py-3" id="launch-btn">
					Launch Codeifyx
				</Link>
				<p className="text-sm text-slightly-gray mt-4">No credit card required. Free sign up.</p>
			</div>
			<div className="relative mt-16 mb-16">
				<div className="absolute inset-0 bg-blue-500 opacity-20 blur-3xl"></div>
				<div className="relative z-10 flex justify-center">
					<Image
						src="/images/codeifyxshowcase.png"
						alt="Codeifyx Image"
						width={800}
						height={450}
						quality={100}
						className="rounded-lg shadow-2xl"
					/>
				</div>
			</div>
			<div className="mt-5">
				<div className="text-center">
					<h2 className="mb-5 headline">Code Smarter, Not Harder: Explore Top Features of CodeifyX</h2>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
					<div>
						<i className="fas fa-code fa-3x mb-3"></i>
						<h3>Smart Code Completion</h3>
						<p>Accelerate your coding with AI-driven predictions that auto-complete your code intelligently, adapting to your style for tailored recommendations.</p>
					</div>
					<div>
						<i className="fas fa-tools fa-3x mb-3"></i>
						<h3>Code Refactoring Suggestions</h3>
						<p>Enhance your code's structure with AI-powered refactoring tips. Optimize readability and efficiency with smart, automated suggestions.</p>
					</div>
					<div>
						<i className="fas fa-code-branch fa-3x mb-3"></i>
						<h3>Cross-Language Integration</h3>
						<p>Code effortlessly in multiple languages. Get customized support and seamless integration across different programming environments.</p>
					</div>
				</div>
				<div className="text-center my-5">
					<Link href="/demo" className="btn btn-primary btn-lg btn-warning">
						Try a Demo
					</Link>
				</div>
			</div>
			<hr />
			{/* Plans section */}
			<div className="mt-5">
				<h2 className="text-center mb-5 header-plans">Codeifyx Plans</h2>
				<div className="flex justify-center">
					<div className="w-full md:w-2/3">
						<table className="w-full table-auto custom-table">
							{/* Table content */}
						</table>
						<div className="text-center my-5 flex justify-center gap-5">
							<Link href="#" className="btn btn-yellow btn-custom">
								Try For Free
								<br />
								<small>$0.00/mo</small>
							</Link>
							<Link href="#" className="btn btn-gradient btn-custom">
								Subscribe Now
								<br />
								<small>$9.99/mo</small>
							</Link>
						</div>
					</div>
				</div>
			</div>
			<div className="gradient-container"></div>
		</main>
	)
}