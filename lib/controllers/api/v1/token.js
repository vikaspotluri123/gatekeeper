import {v1 as api} from '../../../api/index.js';
import {jsonResponse} from '../../../utils/index.js';

const VALID_TOKEN = /^[a-z\d]{128}$/;

export const INVALID_TOKEN = Symbol('Invalid token');

/**
 * @param {unknown} token
 */
export async function getCookieFromToken(token) {
	if (!token || typeof token !== 'string' || !VALID_TOKEN.test(token)) {
		return INVALID_TOKEN;
	}

	return api.token.trade(token);
}

export async function swapTokenForCookie(req, res, next) {
	const cookie = await getCookieFromToken(req.params.token);

	if (!cookie) {
		next();
		return;
	}

	if (cookie === INVALID_TOKEN) {
		return jsonResponse.badRequest(null, res, null, 'Invalid token');
	}

	res.status(200).json({
		type: 'token',
		message: 'token successfully swapped',
		cookie,
		code: 200,
	});
}
