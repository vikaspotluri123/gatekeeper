/*
 * PONG
 * Very basic express server to serve as a client consumer from the auth server, useful for testing and demo
 * Listens on port 2950. Both auth-server.vikaspotluri.ml and auth-client.vikaspotluri.ml point to localhost,
 *  so you shouldn't need to configure anything here :)
*/

import express from 'express';
import got from 'got';
import cookie from 'cookie';

const VALID_TOKEN = /[a-z\d]{128}/;
const API_ROOT = 'http://auth-server.vikaspotluri.ml:3000/api/v1';
const LISTENING = 'http://auth-client.vikaspotluri.ml:2950';
const AUTH_URL = `${API_ROOT}/authenticate?redirect=${LISTENING}/token`;
const COOKIE = 'private.auth.sid';

const app = express();

const wrapGot = (url, options = {}) => {
	options.json = true;
	return got(url, options).catch(error => error);
};

/*
* Token endpoint - receives a token from auth-server via the client.
*    This token is then sent to the auth-server directly in order to
*    the user's cookie. The server cookie that's received is sent to
*    user as a client cookie with the same name.
*/
app.get('/token', async (req, res) => {
	const {token, then} = req.query;

	// Tokens are 128 character hex strings
	if (!VALID_TOKEN.test(token)) {
		return res.end('reject');
	}

	// Make the request to the auth server with the provided token
	const {body} = await wrapGot(`${API_ROOT}/token/${token}`);

	// If the server doesn't respond with a JSON, there's not much that can be done :/
	if (!body) {
		res.end('unexpected error');
	}

	// CASE: Token was successfully swapped
	if (body.code === 200) {
		let redirect = '/';
		try {
			// Attempt to update the redirect URL based on the `then` query param. If something is malformed,
			// the redirect will fall back to `/`
			redirect = new URL(then, LISTENING).pathname;
		} catch {}

		// Update the client cookie with the same name / value that the server uses
		res.cookie(COOKIE, body.cookie).redirect(redirect);
	// CASE: Invalid token
	} else if (body.code === 404) {
		res.end('token not found');
	// CASE: Something weird happened - log it
	} else {
		res.end(JSON.stringify(body));
	}
});

// Log the user out - clear the cookie and end with a success message
app.use('/logout', async (_, res) => {
	res.cookie(COOKIE, '', {maxAge: Date.now() - 10, overwrite: true});
	res.end('logged out');
});

// Handle all other endpoints - validate access and proceed
app.use(async (req, res) => {
	const cookies = cookie.parse(req.headers.cookie || '');
	// CASE: cookie is not set - there's no point in hitting the server endpoint because it's going to faile
	if (!cookies[COOKIE]) {
		return res.redirect(`${AUTH_URL}?then=${req.path}`);
	}

	// Validate the user has permission to access the requested endpoint
	const requestURL = `${LISTENING}${req.originalUrl}`;
	const {body} = await wrapGot(`${API_ROOT}/rest/${requestURL}`, {
		headers: {
			cookie: cookie.serialize(COOKIE, cookies[COOKIE]),
		},
	});

	switch (body.code) {
		// Cookie expired
		case 401: {
			res.redirect(`${AUTH_URL}/?then=${req.path}`);
			break;
		}

		// User does not have access
		case 403: {
			res.end('Permission denied');
			break;
		}

		// User does have permission
		case 200: {
			res.end('hello!');
			break;
		}

		// Something happened to the server. Log the message
		default: {
			res.end(JSON.stringify(body));
		}
	}
});

app.listen(2950, () => console.log('pong on 2950'));
