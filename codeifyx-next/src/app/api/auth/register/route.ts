import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/utils/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import sendEmail from '@/utils/email'

export async function POST(request: NextRequest) {
  await connectDB()

  let body;
  const contentType = request.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    body = await request.json();
  } else {
    const formData = await request.formData();
    body = Object.fromEntries(formData);
  }

  const { username, email, password, confirmPassword } = body;

  if (password !== confirmPassword) {
    return NextResponse.json({ message: 'Passwords do not match' }, { status: 400 })
  }

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: 'Email already in use' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const verificationToken = crypto.randomBytes(20).toString('hex')

    const newUser = new User({
      displayName: username,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken
    })

    await newUser.save()

    const verificationLink = `https://codeifyx.com/verify/${verificationToken}`
    await sendEmail(
      email,
      'Verify Your Email',
      `Please click this link to verify your email: ${verificationLink}`,
      `<p>Please click this link to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`
    )

    return NextResponse.json({ message: 'User registered successfully. Please check your email to verify your account.' }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}