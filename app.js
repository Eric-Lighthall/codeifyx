const path = require('path')
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');

// Load config
dotenv.config({ path: './config/config.env' });

// Passport config
require('./config/passport')(passport);

connectDB();

const app = express();

// use morgan in dev environment for logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// https redirect
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`);
        }
        else {
            next();
        }
    });
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static('public'));

// Handlebars
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: '.hbs',
});

// Register Handlebars helpers
hbs.handlebars.registerHelper('eq', function (a, b) {
    return a === b;
});

// Handlebars
app.engine('.hbs', exphbs.engine({ defaultLayout: 'main', extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', './views');

// Sessions
app.use(session({
    secret: 'toasty bug',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
}))

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
