import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/utils/db'
import User from '@/models/User'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  await connectDB()

  try {
    const user = await User.findOne({ verificationToken: params.token })
    if (!user) {
      return new NextResponse('Invalid or expired token', { status: 400 })
    }

    user.isVerified = true
    user.verificationToken = null
    await user.save()

    return NextResponse.redirect(new URL('/login?verified=true', request.url))
  } catch (err) {
    console.error(err)
    return new NextResponse('Server error', { status: 500 })
  }
}