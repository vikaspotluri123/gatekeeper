import {env} from 'node:process';
import passport from 'passport';
import Strategy from 'passport-google-oauth20';
import * as config from '../config.js';

export function initializePassport() {
	const googleConfig = config.get('google');

	passport.serializeUser((user, cb) => cb(null, user));
	passport.deserializeUser((user, cb) => cb(null, user));

	if (env.NODE_ENV === 'test') {
		return;
	}

	if (!googleConfig) {
		throw new Error('Cannot initialize: [Passport]: Google credentials not supplied!');
	}

	const {clientID, clientSecret, callbackURL} = googleConfig;

	if (!clientID || !clientSecret || !callbackURL) {
		console.warn('Warning: [Passport]: Not providing Client ID, Client Secret, AND Callback URL can create errors');
	}

	const strategyConfig = {
		clientID,
		clientSecret,
		callbackURL,
	};

	passport.use(new Strategy(strategyConfig, (_, __, profile, cb) => {
		cb(null, profile.emails[0].value);
	}));
}
