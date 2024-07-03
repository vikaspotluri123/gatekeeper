import crypto from 'node:crypto';
import {knex} from '../../database/index.js';
import {debug} from './debug.js';

const MAX_TOKEN_AGE = 1000 * 60 * 60 * 1; // Tokens expire after 1 hour

export const create = async function createTokenForCookie(cookie) {
	debug(`creating token for cookie ${cookie}`);
	const [existingToken] = await knex.select('token').from('tokens').where('cookie', cookie);

	if (existingToken) {
		debug(`token for ${cookie} already exists`);
		return existingToken.token;
	}

	const token = crypto.randomBytes(64).toString('hex');
	await knex.insert({cookie, token, created: Date.now()}).into('tokens');
	return token;
};

export const trade = function findCookieAndDestroyToken(token) {
	debug(`finding cookie for token ${token}`);
	return knex.transaction(async transaction => {
		const ctPair = await transaction
			.select('cookie', 'created')
			.from('tokens')
			.where('token', token)
			.forUpdate()
			.first();

		if (!ctPair) {
			debug(`no cookie for token ${token}`);
			return null;
		}

		const createdAt = new Date(ctPair.created);

		if (Date.now() - createdAt.valueOf() > MAX_TOKEN_AGE) {
			debug(`token ${token} is expired`);
			ctPair.cookie = null;
		}

		await transaction.delete().from('tokens').where('token', token);

		return ctPair.cookie;
	});
};

export const cleanup = function clearExpiredTokens() {
	const earliestAge = Date.now() - MAX_TOKEN_AGE;
	return knex.delete()
		.from('tokens')
		.whereRaw('DATETIME(? / 1000, "unixepoch") > DATETIME(created / 1000, "unixepoch")', [earliestAge]);
};
