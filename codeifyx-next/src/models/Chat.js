const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Chat', ChatSchema);