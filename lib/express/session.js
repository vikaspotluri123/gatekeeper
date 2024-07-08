import expressSession from 'express-session';
import {ConnectSessionKnexStore} from 'connect-session-knex';
import passport from 'passport';
import * as config from '../config.js';
import {knex} from '../database/index.js';

export const session = [
	expressSession({
		secret: config.get('secret'),
		resave: true,
		rolling: true,
		saveUninitialized: true,
		cookie: {
			secure: config.get('secure', false),
			path: config.get('path', '/'),
			// The default max age is ~ 1 week
			maxAge: config.get('cookieAge', 1000 * 60 * 60 * 24 * 7),
			httpOnly: true,
			domain: config.get('cookieDomain', undefined),
		},
		get name() {
			return config.safe.cookie;
		},
		store: new ConnectSessionKnexStore({
			knex,
			// Clear expired sessions daily
			cleanupInterval: 1000 * 60 * 60 * 24,
		}),
	}),
	passport.initialize(),
	passport.session(),
	function addLocalContext(req, res, next) {
		if (req.user && req.isAuthenticated()) {
			res.locals.authenticated = true;
			res.locals.user = req.user;
		}

		next();
	},
];
