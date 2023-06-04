import expressSession from 'express-session';
import connectSessionKnex from 'connect-session-knex/lib/index.js';
import passport from 'passport';
import * as config from '../config.js';
import {knex} from '../database/index.js';
const KnexStore = connectSessionKnex(expressSession);

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
			domain: config.get('cookieDomain', undefined)
		},
		name: config.get('cookie', 'private.auth.sid'),
		store: new KnexStore({
			knex,
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
