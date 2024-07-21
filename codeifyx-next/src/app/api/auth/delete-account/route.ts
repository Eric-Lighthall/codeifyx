import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/utils/db'
import User from '@/models/User'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function DELETE(request: NextRequest) {
  await connectDB()

  try {
    // Get token from cookies
    const token = cookies().get('token')?.value

    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string }

    // Find and delete the user
    const user = await User.findByIdAndDelete(decoded.userId)

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    // Clear authentication cookie
    cookies().delete('token')

    return new NextResponse('Account deleted successfully', { status: 200 })
  } catch (error) {
    console.error('Error deleting account:', error)
    return new NextResponse('Server error', { status: 500 })
  }
}