// @ts-check
import {isMatch as matches} from 'matcher';
import {safe as config} from '../../config.js';
import {findDomainIfExists as findDomain} from './find-domain.js';
import {debug} from './debug.js';

/**
* Determines if {user} has permission to access {url}
*
* @param {string} rawUrl <URL> - the URL to check
* @param {string} user <email> - the email address of the user requesting access
* @param {import('../../config/process-acl.js').AccessACL} aclConfig
* @returns {boolean}
*/
export function checkAccess(rawUrl, user, aclConfig = config.acl) {
	debug(`checking permissions for ${user} to access ${rawUrl}`);
	const {rules, allowAdmins = true, admins} = aclConfig;
	const domain = findDomain(rawUrl, aclConfig.domains);

	// CASE: domain doesn't exist in master list - allowByDefault to disallow
	if (!domain) {
		debug(`url ${rawUrl} does not match filter list`);
		return false;
	}

	debug(`domain ${domain} is being used to process ${rawUrl}`);

	const domainHandler = rules.find(rule => rule.domain === domain);
	const url = new URL(rawUrl);

	// CASE: configured to allow admins to access all resources -> always allowed access
	if (allowAdmins && matches(user, admins)) {
		return true;
	}

	if (matches(user, domainHandler.all)) {
		debug(`${user} has permission via rule "${domainHandler.domain}".all`);
		return true;
	}

	const pathHandler = domainHandler.paths.find(rule =>
		matches(url.pathname, rule.path)
		// Remove trailing / (e.g. rule `/path/` will allow `/path`)
		|| matches(url.pathname.replace(/\/$/, ''), rule.path)
		// Remove trailing /* (e.g. rule `/path/*` will allow `/path`)
		|| matches(url.pathname, rule.path.replace(/\/\*$/, '')),
	);

	// CASE: there is no path override -> allow access based on the `allowByDefault` domain rule
	if (!pathHandler) {
		debug(`Handler not found for path ${url.pathname}`);
		return domainHandler.allowByDefault === true;
	}

	// CASE: path allows access by default
	// CASE: user is allowed access to path
	// @ts-expect-error allow is coerced into an array but type def is wonky
	return pathHandler.allowByDefault === true || pathHandler.allow.some(handler => matches(user, handler));
}
