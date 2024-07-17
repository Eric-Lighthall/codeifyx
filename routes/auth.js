const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const crypto = require('crypto');
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
        // TODO: Notify user if an account with the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.redirect('/register');
        }

        // create a new user instance
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(20).toString('hex');

        const newUser = new User({
            displayName: username,
            email,
            password: hashedPassword,
            isVerified: false,
            verificationToken
        });

        // save new user to database
        await newUser.save();

        const verificationLink = `https://codeifyx.com/verify/${verificationToken}`;
        await sendEmail(
            email,
            'Verify Your Email',
            `Please click this link to verify your email: ${verificationLink}`,
            `<p>Please click this link to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`
        );

        res.redirect('/verification-sent');
    } catch (err) {
        console.error(err);
        res.redirect('/register');
    }
});

// @desc Login user
// @route POST /auth/login
router.post('/login', passport.authenticate('local', {
    successRedirect: '/chat', // redirect to chat page on successful login
    failureRedirect: '/login', // redirect to login page on failed login
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