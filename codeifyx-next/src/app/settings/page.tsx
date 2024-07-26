'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle } from 'lucide-react'

export default function SettingsPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const router = useRouter()

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
          const data: { email: string } = await res.json();
          setUserEmail(data.email);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }

    fetchUser();
  }, []);

  const handleDeleteAccount = async () => {
    setIsConfirmDeleteOpen(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        router.push('/');
      } else {
        const data = await res.text();
        console.error('Account deletion failed:', data);
      }
    } catch (error) {
      console.error('Account deletion error:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <p className="mb-4">Email: {userEmail}</p>
        <button 
          onClick={handleDeleteAccount}
          className="flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Account
        </button>
      </div>

      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-96 relative">
            <h2 className="text-2xl font-bold mb-4 flex items-center text-red-500">
              <AlertTriangle className="w-6 h-6 mr-2" />
              Confirm Deletion
            </h2>
            <p className="mb-4">Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteAccount}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}