import mongoose, { Schema, Document } from 'mongoose';

interface IMessage {
  role: string;
  content: string;
}

interface IChat extends Document {
  user: mongoose.Schema.Types.ObjectId;
  title: string;
  language: string;
  messages: IMessage[];
}

const ChatSchema: Schema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  language: {
    type: String,
    required: true,
  },
  messages: [
    {
      role: {
        type: String,
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
    },
  ],
}, { timestamps: true });

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);