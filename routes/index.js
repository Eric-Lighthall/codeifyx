const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const sendMessage = require('../services/llamaApi');

// @desc    Landing page
// @route   GET /
router.get('/', (req, res) => {
  res.render('home', {
    layout: 'home',
    activeLink: 'home',
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
router.get('/chat', ensureAuth, (req, res) => {
  res.render('chat', {
    layout: 'chat',
    name: req.user.firstName,
    activeLink: 'home',
    messages: [],
  });
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