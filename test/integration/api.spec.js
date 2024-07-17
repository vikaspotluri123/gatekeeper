// @ts-check
import supertest from 'supertest';
import {expect} from 'chai';
import {sign} from 'cookie-signature';
import * as config from '../../lib/config.js';
import {processAccessControlList} from '../../lib/config/process-acl.js';
import {aclRules} from '../fixtures/acl-rules.js';

Object.assign(config.raw(), {
	enableExperimentalPublicPaths: true,
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
 * @param {string | string[] | undefined} cookie
 * @param {string | undefined} [domain]
 */
function expectCookieDomain(cookie, domain) {
	if (!cookie) {
		expect(cookie).to.equal(domain);
		return;
	}

	const cookieName = config.raw().cookieDomain;
	if (!Array.isArray(cookie)) {
		cookie = [cookie];
	}

	for (const singleCookie of cookie) {
		if (!singleCookie.includes(cookieName)) {
			continue;
		}

		if (domain) {
			expect(singleCookie).to.include(`Domain=${domain}`);
		} else {
			expect(singleCookie.toLowerCase()).to.not.include('domain=');
		}

		return;
	}

	expect(domain).to.equal(undefined);
}

describe('Integration > Router > API', function () {
/** @type {ReturnType<typeof supertest>} */
	let agent;
	/** @type {Record<'admin' | 'trusted' | 'generic', string>} */
	let cookies;
	let createCookie;

	before(async function () {
		// Defer loading setup functions so the database config can be properly set
		const [{createApp}, {knex}] = await Promise.all([
			import('../../lib/index.js'),
			import('../../lib/database/knex.js'),
		]);

		const app = await createApp();
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
		knex.destroy();
	});

	for (const {name, url, user, shouldHaveAccess, status} of scenarios) {
		it(`/api/v1/http: ${name}`, async function () {
			return agent.get('/api/v1/http')
				.set('x-original-uri', url)
				.set('origin', new URL(url).origin)
				.set('cookie', user ? cookies[user] : '')
				.then(response => {
					const responseCode = status ?? (shouldHaveAccess ? 200 : (user ? 403 : 401));
					expectCookieDomain(response.get('set-cookie'));

					expect(response.status).to.equal(responseCode);
					expect(response.body).to.contain({code: responseCode});
				});
		});
	}

	it('/api/v1/rest: unknown domain (!allowAdmins)', function () {
		return agent.get('/api/v1/rest/https://typo.example.com/')
			.set('origin', 'https://typo.example.com')
			.set('cookie', cookies.admin)
			.then(response => {
				expect(response.status).to.equal(403);
				expect(response.body).to.contain({code: 403});
				expectCookieDomain(response.get('set-cookie'));
			});
	});

	it('/api/v1/http: cookie domain mismatch', async function () {
		const cookie = await createCookie('admin_authonly', 'john@example.com', 'auth.example.com');
		return agent.get('/api/v1/http')
			.set('x-original-uri', 'https://domain3.example.com/path1')
			.set('origin', 'https://domain3.example.com')
			.set('cookie', cookie)
			.then(response => {
				expect(response.status).to.equal(400);
				expect(response.body).to.contain({code: 400});
				expectCookieDomain(response.get('set-cookie'));
			});
	});
});
