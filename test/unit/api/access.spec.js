// @ts-check
const {expect} = require('chai');
const checkAccess = require('../../../lib/api/v1/check-access');

const aclConfig = require('../../../lib/config/process-acl')({
	admins: ['admin*@example.app'],
	rules: [{
		domain: 'public.example.site',
		allowByDefault: true
	}, {
		domain: 'example.site',
		all: ['example.site::all'],
		allowByDefault: false,
		paths: [{
			path: '/protected',
			allow: ['example.site::/protected']
		}]
	}, {
		domain: '*.example.admin',
		all: ['admin'],
		allowByDefault: false,
		paths: [{
			path: '/billing',
			allow: ['billing']
		}, {
			path: '/hr/*',
			allow: ['*@example']
		}, {
			path: '/explicitly-allowed',
			allow: 'joe',
			disableWildcardMatching: true
		}]
	}]
});

const valid = assertion => expect(assertion).to.be.true;
const invalid = assertion => expect(assertion).to.be.false;

describe('Unit > API > Check Access', function () {
	it('admins always have access', function () {
		valid(checkAccess('https://example.site/protected', 'admin@example.app', aclConfig));
		valid(checkAccess('https://example.site/protected', 'admin-joe@example.app', aclConfig));
		valid(checkAccess('https://public.example.site/protected', 'admin-joe@example.app', aclConfig));
	});

	it('public users have access to `allowByDefault` domains', function () {
		valid(checkAccess('https://public.example.site', 'invalid-user', aclConfig));
		invalid(checkAccess('https://example.site', 'invalid-user', aclConfig));
	});

	it('wildcard domains are correctly matched', function () {
		const user = 'billing';
		valid(checkAccess('https://my.example.admin/billing', user, aclConfig));
		valid(checkAccess('https://my.example.admin:8080/billing', user, aclConfig));
		valid(checkAccess('https://user:host@my.example.admin:8080/billing', user, aclConfig));
		valid(checkAccess('https://example.admin/billing', user, aclConfig));
		invalid(checkAccess('https://texample.admin:8000/billing', 'admin', aclConfig));
	});

	it('paths are matched as wildcard unless specified', function () {
		valid(checkAccess('https://billing.example.admin/billing/account', 'billing', aclConfig));
		valid(checkAccess('https://billing.example.admin/billing', 'billing', aclConfig));
		valid(checkAccess('https://billing.example.admin/hr/', 'employee@example', aclConfig));
		valid(checkAccess('https://example.admin/explicitly-allowed', 'joe', aclConfig));
		valid(checkAccess('https://example.admin/explicitly-allowed/', 'joe', aclConfig));
		invalid(checkAccess('https://example.admin/explicitly-allowed/test', 'joe', aclConfig));
	});
});
