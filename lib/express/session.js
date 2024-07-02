import expressSession from 'express-session';
import {ConnectSessionKnexStore} from 'connect-session-knex';
import passport from 'passport';
import * as config from '../config.js';
import {knex} from '../database/index.js';
import {INVALID_TOKEN, getCookieFromToken} from '../controllers/api/v1/token.js';

const COOKIE_NAME = config.get('cookie', 'private.auth.sid');

const enableExperimentalAutomaticTokenSwap = config.get('experimentalAutomaticTokenSwap') === true;

export const session = [
	/**
	 * @param {import('express').Request} request
	 * @param {import('express').Response} _
	 * @param {import('express').NextFunction} next
	 */
	async function tokenSwap(request, _, next) {
		if (!enableExperimentalAutomaticTokenSwap) {
			next();
			return;
		}

		// CASE: No token swap was requested
		// CASE: Our cookie is already set, token swap is ignored
		if (!request.query.token || request.headers.cookie?.includes(COOKIE_NAME)) {
			next();
			return;
		}

		return getCookieFromToken(request.query).then(maybeCookie => {
			if (maybeCookie && maybeCookie !== INVALID_TOKEN) {
				const existingCookie = request.headers.cookie;
				request.headers.cookie = existingCookie ? `${existingCookie}; ${maybeCookie}` : maybeCookie;
			}

			next();
		}).catch(next);
	},
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
		name: COOKIE_NAME,
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
