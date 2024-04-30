const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth');

// @desc    Landing page
// @route   GET /
router.get('/', ensureGuest, (req, res) => {
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

// @desc    Dashboard
// @route   GET /dashboard
router.get('/dashboard', ensureAuth, (req, res) => {
    res.render('dashboard', {
        name: req.user.firstName,
        activeLink: 'home',
    });
});

module.exports = router;