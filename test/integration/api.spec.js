// @ts-check
import supertest from 'supertest';
import {expect} from 'chai';
import {sign} from 'cookie-signature';
import * as config from '../../lib/config.js';
import {processAccessControlList} from '../../lib/config/process-acl.js';
import {aclRules} from '../fixtures/acl-rules.js';

Object.assign(config.raw(), {
	enableExperimentalPublicPaths: true,
	experimentalAutomaticTokenSwap: true,
	db: {
		client: 'sqlite3',
		useNullAsDefault: false,
		connection: {
			filename: ':memory:',
		},
	},
	acl: processAccessControlList(aclRules),
});

const scenarios = [{
	name: 'no auth, public domain',
	url: 'https://cdn.example.com/public',
	shouldHaveAccess: true,
}, {
	name: 'no auth, public path',
	url: 'https://domain3.example.com/public',
	shouldHaveAccess: true,
}, {
	name: 'no auth, unknown path',
	url: 'https://domain3.example.com/no-rule',
	shouldHaveAccess: false,
}, {
	name: 'no auth, no paths',
	url: 'https://domain1.example.com/asset',
	shouldHaveAccess: false,
}, {
	name: 'no auth, empty paths',
	url: 'https://domain2.example.com/asset',
	shouldHaveAccess: false,
}, {
	name: 'not admin, unknown path (all)',
	url: 'https://domain2.example.com/asset',
	shouldHaveAccess: true,
	user: 'trusted',
}, {
	name: 'not admin, unknown path (-all)',
	url: 'https://domain2.example.com/asset',
	shouldHaveAccess: false,
	user: 'generic',
}, {
	name: 'admin, unknown path',
	url: 'https://domain3.example.com/asset',
	shouldHaveAccess: true,
	user: 'admin',
}, {
	name: 'wrong user, known path',
	url: 'https://domain3.example.com/path1',
	shouldHaveAccess: false,
	user: 'generic',
}, {
	name: 'known user, known path',
	url: 'https://domain3.example.com/path1',
	shouldHaveAccess: true,
	user: 'trusted',
}, {
	name: 'unknown domain (cors)',
	url: 'https://typo.example.com/',
	shouldHaveAccess: true,
	user: 'admin',
	status: 400,
}, {
	name: 'wildcard private, explicit private',
	url: 'https://domain3.example.com/path2/public',
	shouldHaveAccess: true,
}, {
	name: 'wildcard public, explicit private',
	url: 'https://domain3.example.com/public/private',
	shouldHaveAccess: false,
}, {
	name: 'no auth, shadowed path (private before public)',
	url: 'https://domain3.example.com/path2/public_ignored',
	shouldHaveAccess: false,
}, {
	name: 'no wildcard, shadowed path (private before public)',
	url: 'https://domain3.example.com/path3/public_ignored',
	shouldHaveAccess: false,
	user: 'generic',
}, {
	name: 'intermediate wildcard, with wildcard',
	url: 'https://domain3.example.com/path4/sub_path/hello',
	shouldHaveAccess: true,
	user: 'trusted',
}, {
	name: 'untrusted intermediate wildcard, with wildcard',
	url: 'https://domain3.example.com/path4/sub_path/hello',
	shouldHaveAccess: false,
	user: 'generic',
}, {
	name: 'intermediate wildcard, wildcard disabled',
	url: 'https://domain3.example.com/path5/sub_path/hello/sub',
	shouldHaveAccess: true,
	user: 'trusted',
}, {
	name: 'untrusted intermediate wildcard, wildcard disabled',
	url: 'https://domain3.example.com/path5/sub_path/hello/sub',
	shouldHaveAccess: false,
	user: 'generic',
}];

/**
 * @param {ReturnType<typeof supertest>} agent
 * @param {{
	url: string;
	status: number;
	cookie?: string;
	xOriginalUrl?: string;
	cookieDomain?: string | undefined;
	body?: Record<any, unknown>
 }} config
 */
async function makeRequest(agent, {url, status, cookie = '', xOriginalUrl = '', cookieDomain = undefined, body = {}}) {
	return agent.get(url)
		.set('x-original-uri', xOriginalUrl)
		.set('origin', xOriginalUrl ? new URL(xOriginalUrl).origin : '')
		.set('cookie', cookie)
		.then(response => {
			const setCookie = response.get('set-cookie');
			expect(response.status).to.equal(status);
			expect(response.body).to.contain({code: status, ...body});

			// If there are no cookies and no cookie domain is requested we don't need to make any assertions
			if (!setCookie && (cookieDomain == setCookie || setCookie?.length === 0)) { // eslint-disable-line eqeqeq
				return;
			}

			const cookieName = config.raw().cookie;
			for (const singleCookie of Array.isArray(setCookie) ? setCookie : [setCookie || '']) {
				if (singleCookie.includes(cookieName)) {
					if (cookieDomain) {
						expect(singleCookie).to.include(`Domain=${cookieDomain}`);
					} else {
						expect(singleCookie).to.not.include('Domain=');
					}

					return;
				}
			}

			expect(false, 'Missing cookie').to.be.true;
		});
}

describe('Integration > Router > API', function () {
/** @type {ReturnType<typeof supertest>} */
	let agent;
	/** @type {Record<'admin' | 'trusted' | 'generic', string>} */
	let cookies;
	let createCookie;
	/** @type {import('../../lib/config/types.js').UserFromRequestFunction} */
	let getUser = () => null;
	/** @type {RegExp} */
	let VALID_TOKEN;

	before(async function () {
		// Defer loading setup functions so the database config can be properly set
		const [{createApp}, {knex}, {VALID_TOKEN: validToken}] = await Promise.all([
			import('../../lib/index.js'),
			import('../../lib/database/knex.js'),
			import('../../lib/controllers/api/v1/token.js'),
		]);

		VALID_TOKEN = validToken;

		const app = await createApp(request => getUser(request));
		agent = supertest(app);

		const {cookie: name, secret} = config.raw();
		// Arbitrary number with enough buffer to allow for stepping through tests
		const expired = new Date(Date.now() + 100_000_000).toISOString();
		/**
		 * @param {string} user
		 * @param {string} email
		 * @param {string} [domain]
		 */
		createCookie = async (user, email, domain) => {
			const cookie = `${name}=s:${sign(user, secret)}`;
			const sess = JSON.stringify({
				cookie: domain ? {domain} : {},
				passport: {user: email},
			});

			await knex('sessions').insert({
				sid: user,
				sess,
				expired,
			});

			return cookie;
		};

		const [admin, trusted, generic] = await Promise.all([
			createCookie('admin', 'john@example.com'),
			createCookie('trusted', 'joe@example.com'),
			createCookie('generic', 'employee@example.com'),
		]);

		cookies = {
			admin,
			trusted,
			generic,
		};
	});

	after(async function () {
		const {knex} = await import('../../lib/database/knex.js');
		await knex('tokens').del();
		knex.destroy();
	});

	for (const {name, url, user, shouldHaveAccess, status} of scenarios) {
		it(`/api/v1/http: ${name}`, async function () {
			return makeRequest(agent, {
				url: '/api/v1/http',
				cookie: user ? cookies[user] : '',
				status: status ?? (shouldHaveAccess ? 200 : (user ? 403 : 401)),
				xOriginalUrl: url,
			});
		});
	}

	it('/api/v1/rest: unknown domain (!allowAdmins)', function () {
		return makeRequest(agent, {
			url: '/api/v1/rest/https://typo.example.com/',
			status: 403,
			cookie: cookies.admin,
		});
	});

	it('/api/v1/http: cookie domain mismatch', async function () {
		const cookie = await createCookie('admin_authonly', 'john@example.com', 'auth.example.com');
		return makeRequest(agent, {
			url: '/api/v1/http',
			status: 400,
			cookie,
			xOriginalUrl: 'https://domain3.example.com/path1',
		});
	});

	it('/api/v1/http: altGetUser', async function () {
		const originalGetUser = getUser;
		getUser = () => ({
			authenticated: true,
			user: 'joe@example.com',
		});

		try {
			await makeRequest(agent, {
				url: '/api/v1/http',
				status: 200,
				xOriginalUrl: 'https://domain3.example.com/path1',
			});
		} finally {
			getUser = originalGetUser;
		}
	});

	it('Token Swap', async function () {
		const url = 'domain3.example.com/path1';
		await agent.get(`/api/v1/authenticate/?redirect=${url}`)
			.expect(302)
			.expect('location', '/login');

		const redirect = await agent.get(`/api/v1/authenticate/?redirect=${url}`)
			.set('cookie', cookies.admin)
			.expect(302)
			.expect('location', new RegExp(`https://${url}\\?token=${VALID_TOKEN.source.slice(1, -1)}`))
			.then(response => response.get('location'));

		await makeRequest(agent, {
			url: '/api/v1/http',
			status: 200,
			xOriginalUrl: redirect,
			cookie: '', // No cookie should be provided since the token is the source
		});
	});
});
