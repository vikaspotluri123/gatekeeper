// @ts-check
import {ensureArray} from '../utils/ensure-array.js';

/**
 * @typedef {object} UnsafePath
 * @property {string | string[]} allow
 * @property {string} path
 * @property {boolean} [allowByDefault]
 * @property {boolean} [disableWildcardMatching]
 *
 * @typedef {object} UnsafeRule
 * @property {string} domain
 * @property {string | string[]} [all]
 * @property {UnsafePath | UnsafePath[]} [paths]
 * @property {boolean} [allowByDefault]
 *
 * @typedef {UnsafePath & {allow: string[]}} Path
 *
 * @typedef {UnsafeRule & {all: string[]; paths: Path[]}} Rule
 *
 * @typedef {object} UnsafeConfiguration
 * @property {string | string[]} [admins]
 * @property {UnsafeRule | UnsafeRule[]} [rules]
 *
 * @typedef {object} ACLConfiguration
 * @property {Readonly<string[]>} admins
 * @property {Readonly<Rule[]>} rules
 * @property {Readonly<string[]>} emails
 * @property {Readonly<string[]>} domains
 * @property {Readonly<boolean>} [allowAdmins]
 * @property {Readonly<Rule[]>} potentialPublicRules
 */

/**
 * @param {UnsafeConfiguration} config
 * @returns	{ACLConfiguration}
 */
export function processAccessControlList(config = {}) {
	/** @type {ACLConfiguration} */
	const safeConfig = {};
	/** @type {Rule[]} */
	const potentialPublicRules = [];

	safeConfig.rules = ensureArray(config.rules);
	safeConfig.admins = ensureArray(config.admins);
	safeConfig.potentialPublicRules = potentialPublicRules;

	const emails = new Set();
	const domains = [];

	// Generate a list of domains and emails, and make sure the schema matches what's expected
	safeConfig.admins.forEach(admin => emails.add(admin));
	safeConfig.rules.forEach(rule => {
		domains.push(rule.domain);
		rule.all = ensureArray(rule.all);
		rule.paths = ensureArray(rule.paths);

		rule.all.forEach(email => emails.add(email));
		/** @type {Rule} */
		let publicRule;
		rule.paths.forEach(path => {
			path.allow = ensureArray(path.allow);
			path.allow.forEach(email => emails.add(email));
			if (!path.disableWildcardMatching) {
				path.path = path.path.endsWith('/*') ? path.path : `${path.path}/*`;
			}

			if (!rule.allowByDefault && path.allowByDefault) {
				publicRule ??= {
					domain: rule.domain,
					all: [],
					allowByDefault: false,
					paths: [],
				};
				// @ts-expect-error the path is properly set up at the beginning of the parent block
				publicRule.paths.push(path);
			}
		});

		if (rule.allowByDefault) {
			potentialPublicRules.push({
				domain: rule.domain,
				all: [],
				allowByDefault: true,
				paths: rule.paths,
			});
		}

		if (publicRule) {
			potentialPublicRules.push(publicRule);
		}
	});

	safeConfig.emails = Array.from(emails);
	safeConfig.domains = domains;

	return safeConfig;
}
