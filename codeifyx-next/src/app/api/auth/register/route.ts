import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '../../../../utils/dbConnect'
import User from '../../../../models/User'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sendEmail } from '../../../../utils/send_email'

type Data = {
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await connectDB()

  const { username, email, password, confirmPassword } = req.body

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' })
  }

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' })
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
      `<p>Please click this link to verify your email: <a href="${verificationLink}">${verificationToken}</a></p>`
    )

    res.status(201).json({ message: 'User registered successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}