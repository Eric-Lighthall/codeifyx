import mongoose, { Document, Model } from 'mongoose'

interface IUser extends Document {
  displayName: string
  email: string
  password: string
  isVerified: boolean
  verificationToken: string
}

const UserSchema = new mongoose.Schema<IUser>({
  displayName: String,
  email: { type: String, unique: true },
  password: String,
  isVerified: Boolean,
  verificationToken: String,
})

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User