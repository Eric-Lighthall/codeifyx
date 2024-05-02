const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

module.exports = function (passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    },
        async (accessToken, refreshToken, profile, done) => {
            const newUser = {
                googleId: profile.id,
                displayName: profile.displayName,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                image: profile.photos[0].value
            }

            try {
                let user = await User.findOne({ googleId: profile.id })

                if (user) {
                    done(null, user);
                }
                else {
                    user = await User.create(newUser);
                    done(null, user);
                }
            }
            catch (err) {
                console.error(err);
            }
        }));

    passport.use(new LocalStrategy(
        { usernameField: 'email' },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ email });
                if (!user) {
                    return done(null, false, { message: 'Incorrect email.' });
                }

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return done(null, false, { message: 'Incorrect password.' });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    ));


    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        done(null, await User.findById(id))
    })
}