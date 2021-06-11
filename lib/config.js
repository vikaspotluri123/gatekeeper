const path = require('path');
const lodashGet = require('lodash.get');
const {getSecret} = require('./utils/index.js');
const processAcl = require('./config/process-acl.js');

const environment = process.env.NODE_ENV || 'development';
const filePath = path.resolve(process.cwd(), `config.${environment}.json`);

let config = {};

const DEFAULT_DB_CONFIG = {
	client: 'sqlite3',
	useNullAsDefault: false,
	connection: {
		filename: path.resolve(__dirname, '../auth.db')
	}
};

function loadConfig() {
	const oldConfig = config;

	try {
		const secret = getSecret();
		delete require.cache[filePath];
		config = require(filePath);
		config.env = environment;
		config.secret = config.secret || secret;
		config.db = config.db && config.db.client ? config.db : DEFAULT_DB_CONFIG;
		config.acl = processAcl(config);

		if (config.basePath) {
			// Ensure preceding slash
			config.basePath = '/' + config.basePath.replace(/^\//, '');
		}
	} catch (error) {
		if (error.code === 'MODULE_NOT_FOUND') {
			console.log('Failed to load config - it does not exist');
			return false;
		}

		console.log('Failed to load config');
		console.error(error);
		config = oldConfig;
		return false;
	}

	return true;
}

module.exports = {
	get(value, defaultResult) {
		return lodashGet(config, value, defaultResult);
	},
	get config() {
		return config;
	},
	set config(_) {
		// (noop)
	},
	_refresh: async () => {
		module.exports.refreshing = true;
		const response = loadConfig();
		module.exports.refreshing = false;
		return response;
	}
};

loadConfig();
