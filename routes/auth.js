const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

// @desc    Auth with Google
// @route   GET /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/chat');
    });

// @desc Register user
// @route POST /auth/register
router.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.redirect('/register');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            displayName: username,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.redirect('/register');
    }
});

// @desc Login user
// @route POST /auth/login
router.post('/login', passport.authenticate('local', {
    successRedirect: '/chat',
    failureRedirect: '/login',
}));

// @desc    Logout user
// @route   /auth/logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err) }
        res.redirect('/')
    })
})

module.exports = router;