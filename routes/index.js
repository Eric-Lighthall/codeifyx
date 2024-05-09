const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const sendMessage = require('../services/llamaApi');
const User = require('../models/User');
const Chat = require('../models/Chat');

// @desc    Landing page
// @route   GET /
router.get('/', (req, res) => {
  let homeUser = null;

  if (req.isAuthenticated()) {
    const user = req.user;
    homeUser = {
      displayName: user.displayName,
      image: user.image,
    };
  }

  res.render('home', {
    layout: 'home',
    activeLink: 'home',
    user: homeUser,
  });
});

// @desc    Login page
// @route   GET /login
router.get('/login', ensureGuest, (req, res) => {
  res.render('login', {
    layout: 'login',
    activeLink: 'home',
  });
});

// @desc    Signup page
// @route   GET /signup
router.get('/signup', ensureGuest, (req, res) => {
  res.render('signup', {
    layout: 'login',
    activeLink: 'home',
  });
});

// @desc Chat page with specific ID
// @route GET /chat/:id
router.get('/chat/:id?', ensureAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const chatUser = {
      displayName: user.displayName,
      image: user.image,
    };

    const languages = [
      { name: 'Python', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg' },
      { name: 'JavaScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg' },
      { name: 'Java', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg' },
    ];

    const selectedLanguage = languages[0];

    const recentChats = await Chat.find({ user: userId })
      .sort({ updatedAt: 1 })
      .limit(5)
      .lean();

    const recentChatsData = recentChats.map(chat => ({
      id: chat._id.toString(),
      title: chat.title,
    }));

    let chat = null;
    let messages = [];
    let chatId = null;

    if (req.params.id) {
      chatId = req.params.id;
      chat = await Chat.findOne({ _id: chatId, user: userId }).populate('messages');
      if (chat) {
        messages = chat.messages.map(message => ({
          role: message.role,
          content: message.content,
        }));
        chatId = chat._id.toString();
      }
    }

    res.render('chat', {
      chat: chat,
      chatId: chatId,
      layout: 'chat',
      activeLink: 'home',
      messages: messages,
      user: chatUser,
      recentChats: recentChatsData,
      languages: languages,
      selectedLanguage: selectedLanguage,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// @desc    Chat API
// @route   POST /api/chat
router.post('/api/chat', ensureAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const message = req.body.message;
    const chatId = req.body.chatId;
    const selectedLanguage = req.body.language;

    let chat;

    if (chatId) {
      // Update existing chat
      chat = await Chat.findOne({ _id: chatId, user: userId });
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }
      if (chat) {
        chat.messages.push({
          role: 'user',
          content: message,
        });
      }
    } else {
      // Create new chat
      chat = new Chat({
        user: userId,
        title: 'New Chat',
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
      });
    }

    await chat.save();

    sendMessage(message, res, chat, selectedLanguage);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// @desc Delete chat
// @route DELETE /api/chat/:id
router.delete('/api/chat/:id', ensureAuth, async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user._id;

    const chat = await Chat.findOneAndDelete({ _id: chatId, user: userId });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

module.exports = router;