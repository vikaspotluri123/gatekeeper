// @ts-check
import {expect} from 'chai';
import {processAccessControlList} from '../../../lib/config/process-acl.js';

describe('Unit > Process acl', function () {
	it('empty config', function () {
		expect(processAccessControlList({})).to.deep.equal({
			rules: [],
			admins: [],
			domains: [],
			emails: [],
			potentialPublicRules: [],
		});
	});

	it('general use cases', function () {
		expect(processAccessControlList({
			admins: 'john@example.com', // Should be coerced to an Array
			rules: [{ // Only domain provided
				domain: 'domain1.example.com',
			}, { // No paths provided
				domain: 'domain2.example.com',
				paths: [],
				all: 'joe@example.com', // Should be coerced to an Array
			}, {
				domain: 'domain3.example.com',
				paths: [{
					path: '/path1', // Wildcard should be added
					allow: 'joe@example.com', // Should be coerced to an Array
				}, {
					path: '/path2/*', // Second wildcard should not be added
					allow: ['john@example.com', 'joe@example.com'],
				}, {
					path: '/path3/', // Wildcard should not be added
					disableWildcardMatching: true,
					allow: ['joe@example.com'],
				}, {
					path: '/path4/*/hello', // Wildcard should not be added
					disableWildcardMatching: true,
					allow: ['john@example.com', 'joe@example.com'],
				}, {
					path: '/path5/*/hello', // Should end up with 2 wildcards
					allow: ['john@example.com', 'joe@example.com'],
				// @ts-expect-error `allow` not provided
				}, {
					path: '/public',
					allowByDefault: true,
				}],
				all: ['john@example.com', 'joe@example.com'],
			}, {
				domain: 'cdn.example.com',
				allowByDefault: true,
			}],
		})).to.deep.equal({
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
					path: '/path2/*',
					allow: ['john@example.com', 'joe@example.com'],
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
					path: '/public/*',
					allowByDefault: true, // Should be the only path in `potentialPublicRules`
					allow: [],
				}],
			}, {
				domain: 'cdn.example.com',
				all: [],
				paths: [],
				allowByDefault: true,
			}],
			potentialPublicRules: [{
				domain: 'domain3.example.com',
				allowByDefault: false,
				all: [],
				paths: [{
					path: '/public/*',
					allow: [],
					allowByDefault: true,
				}],
			}, {
				domain: 'cdn.example.com',
				allowByDefault: true,
				all: [],
				paths: [],
			}],
			admins: ['john@example.com'],
			domains: ['domain1.example.com', 'domain2.example.com', 'domain3.example.com', 'cdn.example.com'],
			emails: ['john@example.com', 'joe@example.com'],
		});
	});
});
