import Image from 'next/image';
import Link from 'next/link';

export default function SignUp() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-950">
      <div className="mb-8">
        <Link href="/">
          <Image 
            src="/images/codeifyxlogo3.webp" 
            alt="Codeifyx Logo" 
            width={200} 
            height={52} 
            className="cursor-pointer"
          />
        </Link>
      </div>
      <div className="w-full max-w-md">
        <div className="bg-gray-900 shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
          <h1 className="text-3xl font-bold text-center mb-6 text-white">Create an Account</h1>
          <form action="/auth/register" method="POST">
            <div className="mb-4">
              <input
                type="text"
                name="username"
                className="w-full px-3 py-2 text-white bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-indigo-500"
                placeholder="Username"
                autoComplete="off"
              />
            </div>
            <div className="mb-4">
              <input
                type="email"
                name="email"
                className="w-full px-3 py-2 text-white bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-indigo-500"
                placeholder="Email"
                autoComplete="off"
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                name="password"
                className="w-full px-3 py-2 text-white bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-indigo-500"
                placeholder="Password"
              />
            </div>
            <div className="mb-6">
              <input
                type="password"
                name="confirmPassword"
                className="w-full px-3 py-2 text-white bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-indigo-500"
                placeholder="Confirm Password"
              />
            </div>
            <div className="mb-6">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Sign Up
              </button>
            </div>
          </form>
          <div className="text-center mb-4">
            <small className="text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
                Login
              </Link>
            </small>
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className="border-t border-gray-800 flex-grow mr-3"></div>
            <span className="text-gray-500">OR</span>
            <div className="border-t border-gray-800 flex-grow ml-3"></div>
          </div>
          <div className="space-y-3">
            <a href="/auth/google" className="flex items-center justify-center px-4 py-2 border border-gray-800 rounded-lg text-white hover:bg-gray-800 transition duration-300">
              <Image src="/images/google.svg" alt="Google" width={20} height={20} className="mr-2" />
              <span>Continue with Google</span>
            </a>
            <a href="/auth/microsoft" className="flex items-center justify-center px-4 py-2 border border-gray-800 rounded-lg text-white hover:bg-gray-800 transition duration-300">
              <Image src="/images/microsoft.svg" alt="Microsoft" width={20} height={20} className="mr-2" />
              <span>Continue with Microsoft</span>
            </a>
            <a href="/auth/apple" className="flex items-center justify-center px-4 py-2 border border-gray-800 rounded-lg text-white hover:bg-gray-800 transition duration-300">
              <Image src="/images/apple.svg" alt="Apple" width={20} height={20} className="mr-2" />
              <span>Continue with Apple</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}