// @ts-check

/** @type {import('../../lib/config/process-acl.js').UnsafeConfiguration} */
export const aclRules = {
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
			path: '/path2/public',
			allowByDefault: true,
			allow: [],
		}, {
			path: '/path2/*', // Second wildcard should not be added
			allow: ['john@example.com', 'joe@example.com'],
		}, {
			path: '/path2/public_ignore', // Path wildcard will take preference
			allow: [],
			allowByDefault: true,
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
		}, {
			path: '/public/private',
			allow: ['john@example.com', 'joe@example.com'],
			// @ts-expect-error `allow` not provided
		}, {
			path: '/public',
			allowByDefault: true,
			// @ts-expect-error `allow` not provided
		}, {
			path: '/favicon.ico',
			allowByDefault: true,
			disableWildcardMatching: true,
		}],
		all: ['john@example.com', 'joe@example.com'],
	}, {
		domain: 'cdn.example.com',
		allowByDefault: true,
	}],
};
