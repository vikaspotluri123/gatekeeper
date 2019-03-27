const VALID_TOKEN = new RegExp('[a-z0-9]{128}');
const API_ROOT = 'http://dev.vikaspotluri.ml:3000/api/v1';
const LISTENING = 'http://pong.vikaspotluri.ml:2950';
const AUTH_URL = `${API_ROOT}/authenticate?redirect=${LISTENING}/token`;
const COOKIE = 'private.auth.sid';

const {URL} = require('url');
const app = require('express')();
const got = require('got');
const cookie = require('cookie');

const wrapGot = (url, options = {}) => {
	options.json = true;
	return got(url, options).catch(e => e); // eslint-disable-line unicorn/catch-error-name
};

app.get('/token', async (req, res) => {
	const {token, then} = req.query;

	if (!VALID_TOKEN.test(token)) {
		return res.end('reject');
	}

	const {body} = await wrapGot(`${API_ROOT}/token/${token}`);
	if (!body) {
		res.end('unexpected error');
	}

	if (body.code === 200) {
		let redirect = '/';
		try {
			redirect = new URL(then, LISTENING).pathname;
		} catch (_) {}

		res.cookie(COOKIE, body.cookie).redirect(redirect);
	} else if (body.code === 404) {
		res.end('token not found');
	} else {
		res.end(JSON.stringify(body));
	}
});

app.use('/logout', async (_, res) => {
	res.cookie(COOKIE, '', {maxAge: Date.now() - 10, overwrite: true});
	res.end('logged out');
});

app.use(async (req, res) => {
	const cookies = cookie.parse(req.headers.cookie || '');
	if (!cookies[COOKIE]) {
		return res.redirect(`${AUTH_URL}?then=${req.path}`);
	}

	const requestURL = `${LISTENING}${req.originalUrl}`;
	const {body} = await wrapGot(`${API_ROOT}/rest/${requestURL}`, {
		headers: {
			cookie: cookie.serialize(COOKIE, cookies[COOKIE])
		}
	});

	if (body.code === 401) {
		res.redirect(`${AUTH_URL}/?then=${req.path}`);
	} else if (body.code === 403) {
		res.end('Permission denied');
	} else if (body.code === 200) {
		res.end('hello!');
	} else {
		res.end(JSON.stringify(body));
	}
});

app.listen(2950, () => console.log('pong on 2950'));
