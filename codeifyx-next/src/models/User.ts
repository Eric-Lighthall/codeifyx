import mongoose, { Document, Model } from 'mongoose'

interface IUser extends Document {
  displayName: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationToken?: string | null;
}

const UserSchema = new mongoose.Schema<IUser>({
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: null }
})

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User