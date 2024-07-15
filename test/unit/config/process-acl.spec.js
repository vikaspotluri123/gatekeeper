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
			public: {
				rules: [],
				admins: [],
				domains: [],
				allowAdmins: false,
			},
			potentialPublicUrlRegex: undefined,
		});
	});

	it('general use cases', function () {
		expect(processAccessControlList(aclRules)).to.deep.equal({
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
			public: {
				admins: [],
				allowAdmins: false,
				domains: ['domain3.example.com', 'cdn.example.com'],
				rules: [{
					domain: 'domain3.example.com',
					allowByDefault: false,
					all: [],
					paths: [{
						path: '/public/*',
						allow: [],
						allowByDefault: true,
					}, {
						path: '/favicon.ico',
						disableWildcardMatching: true,
						allow: [],
						allowByDefault: true,
					}],
				}, {
					domain: 'cdn.example.com',
					allowByDefault: true,
					all: [],
					paths: [],
				}],
			},
			potentialPublicUrlRegex: /domain3\.example\.com\/public|domain3\.example\.com\/favicon\.ico|cdn\.example\.com/,
			admins: ['john@example.com'],
			domains: ['domain1.example.com', 'domain2.example.com', 'domain3.example.com', 'cdn.example.com'],
			emails: ['john@example.com', 'joe@example.com'],
		});
	});
});
