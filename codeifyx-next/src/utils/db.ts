import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGO_URI as string

if (!MONGO_URI) {
  throw new Error(
    'MONGODB_URI is not defined'
  )
}

export async function connectDB() {
  if (mongoose.connections[0].readyState) return

  await mongoose.connect(MONGO_URI)
}