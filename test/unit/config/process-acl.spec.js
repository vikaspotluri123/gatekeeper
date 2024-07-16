// @ts-check
import {expect} from 'chai';
import {processAccessControlList} from '../../../lib/config/process-acl.js';
import {aclRules} from '../../fixtures/acl-rules.js';

describe('Unit > Process acl', function () {
	it('empty config', function () {
		expect(processAccessControlList({})).to.deep.equal({
			rules: [],
			admins: [],
			domains: [],
			emails: [],
		});
	});

	it('general use cases', function () {
		expect(processAccessControlList(aclRules)).to.deep.equal({
			admins: ['john@example.com'],
			rules: [{
				domain: 'domain1.example.com',
				all: [],
				paths: [],
			}, {
				domain: 'domain2.example.com',
				all: ['joe@example.com'],
				paths: [],
			}, {
				domain: 'domain3.example.com',
				all: ['john@example.com', 'joe@example.com'],
				paths: [{
					path: '/path1/*',
					allow: ['joe@example.com'],
				}, {
					path: '/path2/public/*',
					allow: [],
					allowByDefault: true,
				}, {
					path: '/path2/*',
					allow: ['john@example.com', 'joe@example.com'],
				}, {
					path: '/path2/public_ignored/*',
					allow: [],
					allowByDefault: true,
				}, {
					path: '/path3/',
					disableWildcardMatching: true,
					allow: ['joe@example.com'],
				}, {
					path: '/path4/*/hello',
					disableWildcardMatching: true,
					allow: ['john@example.com', 'joe@example.com'],
				}, {
					path: '/path5/*/hello/*',
					allow: ['john@example.com', 'joe@example.com'],
				}, {
					path: '/public/private/*',
					allow: ['john@example.com', 'joe@example.com'],
				}, {
					path: '/public/*',
					allowByDefault: true, // Should be in `potentialPublicRules`
					allow: [],
				}, {
					path: '/favicon.ico',
					allowByDefault: true, // Should be in `potentialPublicRules`
					disableWildcardMatching: true,
					allow: [],
				}],
			}, {
				domain: 'cdn.example.com',
				all: [],
				paths: [],
				allowByDefault: true,
			}],
			domains: ['domain1.example.com', 'domain2.example.com', 'domain3.example.com', 'cdn.example.com'],
			emails: ['john@example.com', 'joe@example.com'],
		});
	});
});
