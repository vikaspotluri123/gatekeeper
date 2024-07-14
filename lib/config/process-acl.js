// @ts-check
import regexEscapeLib from 'escape-string-regexp';
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
 * @typedef {object} AccessACL
 * @property {Readonly<string[]>} admins
 * @property {Readonly<Rule[]>} rules
 * @property {Readonly<boolean>} [allowAdmins]
 * @property {Readonly<string[]>} domains
 *
 * @typedef {object} InnerACLConfiguration
 * @property {Readonly<string[]>} emails
 * @property {AccessACL} public
 * @property {RegExp} [potentialPublicUrlRegex]
 *
 * @typedef {AccessACL & InnerACLConfiguration} ACLConfiguration
 */

// Automatically use RegExp.escape when it's available
// https://github.com/tc39/proposal-regex-escaping
/** @type {typeof regexEscapeLib} */
// @ts-expect-error
const regexEscape = Object.hasOwn(RegExp, 'escape') ? RegExp.escape : regexEscapeLib;

/**
 * @param {UnsafeConfiguration} config
 * @returns	{ACLConfiguration}
 */
export function processAccessControlList(config = {}) {
	const emails = new Set();
	/** @type {string[]} */
	const domains = [];
	/** @type {string[]} */
	const publicDomains = [];
	/** @type {Rule[]} */
	const publicRules = [];
	/** @type {string[]} */
	const publicRegex = [];

	/** @type {ACLConfiguration} */
	const safeConfig = {
		rules: ensureArray(config.rules),
		admins: ensureArray(config.admins),
		public: {
			rules: publicRules,
			admins: [],
			allowAdmins: false,
			domains: publicDomains,
		},
		domains,
		emails: [],
		potentialPublicUrlRegex: undefined,
	};

	// Generate a list of domains and emails, and make sure the schema matches what's expected
	safeConfig.admins.forEach(admin => emails.add(admin));
	for (const rule of safeConfig.rules) {
		domains.push(rule.domain);
		rule.all = ensureArray(rule.all);
		rule.paths = ensureArray(rule.paths);

		rule.all.forEach(email => emails.add(email));
		/** @type {Rule} */
		let publicRule;

		for (const path of rule.paths) {
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
				publicRule.paths.push(path);
				publicRegex.push(regexEscape(publicRule.domain + path.path.replace(/\/\*$/, '')));
			}
		}

		if (rule.allowByDefault) {
			publicRules.push({
				domain: rule.domain,
				all: [],
				allowByDefault: true,
				paths: rule.paths,
			});
			publicRegex.push(regexEscape(rule.domain));
			publicDomains.push(rule.domain);
		}

		if (publicRule) {
			publicRules.push(publicRule);
			publicDomains.push(publicRule.domain);
		}
	}

	safeConfig.emails = Array.from(emails);
	if (publicRegex.length > 0) {
		safeConfig.potentialPublicUrlRegex = new RegExp(publicRegex.join('|'));
	}

	return safeConfig;
}
