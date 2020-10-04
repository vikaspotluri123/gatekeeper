// @ts-check
const valid = require('matcher').isMatch;
const config = require('../../config');
const findDomain = require('./find-domain');
const debug = require('./debug');

/**
* Determines if {user} has permission to access {url}
*
* @param {string} rawUrl <URL> - the URL to check
* @param {string} user <email> - the email address of the user requesting access
* @param {import('../../config/process-acl').ACLConfiguration} aclConfig
* @returns {boolean}
*/
module.exports = function checkAccess(rawUrl, user, aclConfig = config.get('acl')) {
	debug(`checking permissions for ${user} to access ${rawUrl}`);
	const {rules, allowAdmins = true} = aclConfig;
	const domain = findDomain(rawUrl);

	// CASE: domain doesn't exist in master list - allowByDefault to disallow
	if (!domain) {
		debug(`url ${rawUrl} does not match filter list`);
		return false;
	}

	debug(`domain ${domain} is being used to process ${rawUrl}`);

	const domainHandler = rules.find(rule => rule.domain === domain);
	const url = new URL(rawUrl);

	// CASE: configured to allow admins to access all resources -> always allowed access
	if (allowAdmins && config.get('admins').includes(user)) {
		return true;
	}

	if (domainHandler.all.includes(user)) {
		debug(`${user} has permission via rule "${domainHandler.domain}".all`);
		return true;
	}

	const pathHandler = domainHandler.paths.find(rule =>
		valid(url.pathname, rule.path) ||
		// Remove trailing /* (e.g. rule `/path/*` will allow `/path`)
		valid(url.pathname, rule.path.replace(/\/\*$/, ''))
	);

	// CASE: there is no path override -> allow access based on the `allowByDefault` domain rule
	if (!pathHandler) {
		debug(`Handler not found for path ${url.pathname}`);
		return domainHandler.allowByDefault === true;
	}

	// CASE: path allows access by default
	// CASE: user is allowed access to path
	return pathHandler.allowByDefault === true || pathHandler.allow.includes(user);
};
