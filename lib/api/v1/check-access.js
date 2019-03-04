const {URL} = require('url');
const valid = require('matcher').isMatch;
const config = require('../../config');
const findDomain = require('./find-domain');
const debug = require('./debug');

/*
* @name: checkAccess
* @description: determines if {user} has permission to access {url}
* @param: {url}<URL> - the URL to check
* @param: {user}<email> - the email address of the user requesting access
* @returns: hasAccess<boolean> - if {user} has permission to access {url}
*/
module.exports = function checkAccess(url, user) {
	debug(`checking permissions for ${user} to access ${url}`);
	const rules = config.get('rules');
	const allowAdmins = config.get('allowAdmins', true);
	const domain = findDomain(url);

	// CASE: domain doesn't exist in master list - allowByDefault to disallow
	if (!domain) {
		debug(`url ${url} does not match filter list`);
		return false;
	}

	debug(`domain ${domain} is being used to process ${url}`);

	const domainHandler = rules.find(rule => rule.domain === domain);
	url = new URL(url);

	// CASE: configured to allow admins to access all resources -> always allowed access
	if (allowAdmins && config.get('admins').includes(user)) {
		return true;
	}

	if (domainHandler.all.includes(user)) {
		debug(`${user} has permission via rule "${domainHandler.domain}".all`);
		return true;
	}

	const pathHandler = domainHandler.paths.find(
		rule => (valid(url.pathname, rule.path) ||
		// Remove trailing /* (e.g. rule `/path/*` will allow `/path`)
		valid(url.pathname, rule.path.replace(/\/\*$/, '')))
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
