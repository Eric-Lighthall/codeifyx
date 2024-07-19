import Link from 'next/link';

export default function VerificationSent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-gray-900 shadow-lg rounded-lg px-8 py-10 mb-4">
          <div className="mb-6">
            <svg className="mx-auto w-20 h-20 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-center mb-6 text-white">Verification Email Sent</h1>
          <p className="text-gray-300 text-center mb-4">
            We've sent a verification email to your inbox. Please click the link in the email to verify your account.
          </p>
          <p className="text-gray-300 text-center mb-6">
            If you don't see the email, please check your spam folder.
          </p>
          <div className="flex justify-center">
            <Link href="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}