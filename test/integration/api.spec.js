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

/** @type {ReturnType<typeof supertest>} */
let agent;
/** @type {Record<'admin' | 'trusted' | 'generic', string>} */
let cookies;

before(async function () {
	// Defer loading setup functions so the database config can be properly set
	const [{createApp}, {knex}] = await Promise.all([
		import('../../lib/index.js'),
		import('../../lib/database/knex.js'),
	]);

	const app = await createApp();
	agent = supertest(app);

	const {cookie: name, secret} = config.raw();
	// Arbitrary number with enough buffer to allow for walking through tests
	const expired = new Date(Date.now() + 100_000_000).toISOString();

	cookies = {
		admin: `${name}=s:${sign('admin', secret)}`,
		trusted: `${name}=s:${sign('trusted', secret)}`,
		generic: `${name}=s:${sign('generic', secret)}`,
	};

	await knex('sessions')
		.insert([{
			sid: 'admin',
			sess: JSON.stringify({cookie: {}, passport: {user: 'john@example.com'}}),
			expired,
		}, {
			sid: 'trusted',
			sess: JSON.stringify({cookie: {}, passport: {user: 'joe@example.com'}}),
			expired,
		}, {
			sid: 'generic',
			sess: JSON.stringify({cookie: {}, passport: {user: 'employee@example.com'}}),
			expired,
		}]);
});

after(async function () {
	const {knex} = await import('../../lib/database/knex.js');
	knex.destroy();
});

describe('Integration > Router > API', function () {
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
	}];

	for (const {name, url, user, shouldHaveAccess, status} of scenarios) {
		it(`/api/v1/http: ${name}`, async function () {
			return agent.get('/api/v1/http')
				.set('x-original-uri', url)
				.set('origin', new URL(url).origin)
				.set('cookie', user ? cookies[user] : '')
				.then(response => {
					const responseCode = status ?? (shouldHaveAccess ? 200 : (user ? 403 : 401));
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
			});
	});
});
