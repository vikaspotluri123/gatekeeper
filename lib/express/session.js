import expressSession from 'express-session';
import {ConnectSessionKnexStore} from 'connect-session-knex';
import passport from 'passport';
import * as config from '../config.js';
import {knex} from '../database/index.js';

class WrappedConnectSessionKnexStore extends ConnectSessionKnexStore {
	/**
	 * @description Wrapper around ConnectSessionKnexStore to support decoupling the session and cookie durations.
	 * @param {Partial<import('connect-session-knex').ConnectSessionKnexStore['options']> & {sessionAge: number}} options
	 * `options.sessionLength` is how long the session should last in milliseconds.
	 */
	constructor(options) {
		const {sessionAge} = options;
		delete options.sessionAge;

		super(options);
		/** @type {number} */
		this._sessionAge = sessionAge;
	}

	/** @override */
	async set(sid, session, callback) {
		return super.set(sid, this._useSessionAge(session), callback);
	}

	/** @override */
	async touch(sid, session, callback) {
		return super.set(sid, this._useSessionAge(session), callback);
	}

	/**
	 * @private
	 * @param {Express.Request['session']!} session
	 * @returns {Express.Request['session']}
	 */
	_useSessionAge(session) {
		if (!session.cookie?.maxAge && !session.cookie?.expires) {
			return session;
		}

		return {
			...session,
			cookie: {
				...session.cookie,
				maxAge: this._sessionAge,
				expires: new Date(Date.now() + this._sessionAge),
			},
		};
	}
}

const sessionAge = config.get('sessionAge');
const cleanupInterval = 1000 * 60 * 60 * 24; // 1 day

export const session = [
	expressSession({
		secret: config.get('secret'),
		resave: false, // ConnectSessionKnex supports touch
		rolling: true,
		saveUninitialized: false,
		cookie: {
			secure: config.get('secure', false),
			path: config.get('path', '/'),
			// The default max age is ~ 1 week
			maxAge: config.get('cookieAge', 1000 * 60 * 60 * 24 * 7),
			httpOnly: true,
			domain: config.get('cookieDomain', undefined),
		},
		name: config.safe.cookie,
		store: sessionAge
			? new WrappedConnectSessionKnexStore({knex, cleanupInterval, sessionAge})
			: new ConnectSessionKnexStore({knex, cleanupInterval}),
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
