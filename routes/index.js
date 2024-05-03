const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const sendMessage = require('../services/llamaApi');
const User = require('../models/User');

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

// @desc    Dashboard
// @route   GET /dashboard
router.get('/chat', ensureAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const chatUser = {
      displayName: user.displayName,
      image: user.image,
    };
    res.render('chat', {
      layout: 'chat',
      activeLink: 'home',
      messages: [],
      user: chatUser,
    });
  }
  catch (error) {
    console.error('Error fetching user data:', error);
    res.redirect('/login');
  }
});

// @desc    Chat API
// @route   POST /api/chat
router.post('/api/chat', ensureAuth, async (req, res) => {
  try {
    const message = req.body.message;

    sendMessage(message, res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

module.exports = router;