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
 */

/**
 * @param {UnsafeConfiguration} config
 * @returns	{ACLConfiguration}
 */
export function processAccessControlList(config = {}) {
	const emails = new Set();
	/** @type {string[]} */
	const domains = [];

	/** @type {ACLConfiguration} */
	const safeConfig = {
		rules: ensureArray(config.rules),
		admins: ensureArray(config.admins),
		domains,
		emails: [],
	};

	// Generate a list of domains and emails, and make sure the schema matches what's expected
	safeConfig.admins.forEach(admin => emails.add(admin));
	for (const rule of safeConfig.rules) {
		domains.push(rule.domain);
		rule.all = ensureArray(rule.all);
		rule.paths = ensureArray(rule.paths);

		rule.all.forEach(email => emails.add(email));

		for (const path of rule.paths) {
			path.allow = ensureArray(path.allow);
			path.allow.forEach(email => emails.add(email));
			if (!path.disableWildcardMatching) {
				path.path = path.path.endsWith('/*') ? path.path : `${path.path}/*`;
			}
		}
	}

	safeConfig.emails = Array.from(emails);
	return safeConfig;
}
