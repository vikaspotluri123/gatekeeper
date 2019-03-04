const MAX_TOKEN_AGE = 1000 * 60 * 60 * 1; // Tokens expire after 1 hour
const crypto = require('crypto');
const {knex} = require('../../database');
const debug = require('./debug');

module.exports.create = async function createTokenForCookie(cookie) {
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

module.exports.trade = async function findCookieAndDestroyToken(token) {
	debug(`finding cookie for token ${token}`);
	const [ctPair] = await knex.select('cookie', 'created').from('tokens').where('token', token);

	if (!ctPair) {
		debug(`no cookie for token ${token}`);
		return null;
	}

	const createdAt = new Date(ctPair.created);

	if (Date.now() - createdAt > MAX_TOKEN_AGE) {
		debug(`token ${token} is expired`);
		ctPair.cookie = null;
	}

	await knex.delete().from('tokens').where('token', token);

	return ctPair.cookie;
};

module.exports.cleanup = function clearExpiredTokens() {
	const earliestAge = Date.now() - MAX_TOKEN_AGE;
	return knex.delete()
		.from('tokens')
		.whereRaw('DATETIME(? / 1000, "unixepoch") > DATETIME(created / 1000, "unixepoch")', [earliestAge]);
};
