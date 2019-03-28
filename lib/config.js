const path = require('path');
const lodashGet = require('lodash.get');
const {ensureArray, getSecret} = require('./utils');

const environment = process.env.NODE_ENV || 'development';
const filePath = require.resolve(`../config.${environment}.json`);

let config = {};

const DEFAULT_DB_CONFIG = {
	client: 'sqlite3',
	useNullAsDefault: false,
	connection: {
		filename: path.resolve(__dirname, '../auth.db')
	}
};

async function loadConfig() {
	const oldConfig = config;

	try {
		// Store the promise, not the value
		const secret = getSecret();
		delete require.cache[filePath];
		config = require(filePath);

		config.rules = ensureArray(config.rules);
		config.admins = ensureArray(config.admins);

		const emails = new Set();
		const domains = [];

		// Generate a list of domains and emails, and make sure the schema matches what's expected
		config.admins.forEach(admin => emails.add(admin));
		config.rules.forEach(rule => {
			domains.push(rule.domain);
			rule.all = ensureArray(rule.all);
			rule.paths = ensureArray(rule.paths);

			rule.all.forEach(email => emails.add(email));
			rule.paths.forEach(path => {
				path.allow = ensureArray(path.allow);
				path.allow.forEach(email => emails.add(email));
			});
		});

		config.emails = Array.from(emails);
		config.domains = domains;
		config.env = environment;

		if (!config.db || !config.db.client) {
			config.db = DEFAULT_DB_CONFIG;
		}

		if (!config.secret) {
			config.secret = await secret;
		}
	} catch (error) {
		console.log('Failed to load config');
		console.error(error);
		config = oldConfig;
		return false;
	}

	return true;
}

module.exports = {
	ready: loadConfig(),
	get(value, defaultResult) {
		return lodashGet(config, value, defaultResult);
	},
	get config() {
		return config;
	},
	set config(val) {
		return false;
	},
	_refresh: async () => {
		await module.exports.ready;
		const promise = loadConfig();
		module.exports.ready = promise;
		return promise;
	}
};
