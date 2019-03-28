const session = require('express-session');
const KnexStore = require('connect-session-knex')(session);
const passport = require('passport');
const config = require('../config');

module.exports = [
	session({
		secret: config.get('secret'),
		resave: true,
		rolling: true,
		saveUninitialized: true,
		cookie: {
			secure: config.get('secure', false),
			path: config.get('path', '/'),
			// The default max age is ~ 1 week
			maxAge: config.get('cookieAge', 1000 * 60 * 60 * 24 * 7)
		},
		name: config.get('cookie', 'private.auth.sid'),
		store: new KnexStore({
			knex: require('../database').knex,
			// Clear expired sessions daily
			clearInterval: 1000 * 60 * 60 * 24
		})
	}),
	passport.initialize(),
	passport.session(),
	function addLocalContext(req, res, next) {
		if (req.user && req.isAuthenticated()) {
			res.locals.authenticated = true;
			res.locals.user = req.user;
		}

		next();
	}
];
