import {readFileSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import lodashGet from 'lodash.get';
import {getSecret} from './utils/index.js';
import {processAccessControlList as processAcl} from './config/process-acl.js';

const __dirname = fileURLToPath(path.dirname(import.meta.url));

const environment = process.env.NODE_ENV || 'development';
const filePath = path.resolve(process.cwd(), `config.${environment}.json`);

let config = {};
let _refreshing = false;

const DEFAULT_DB_CONFIG = {
	client: 'sqlite3',
	useNullAsDefault: false,
	connection: {
		filename: path.resolve(__dirname, '../auth.db'),
	},
};

function loadConfig() {
	const oldConfig = config;

	try {
		const secret = getSecret();
		config = JSON.parse(readFileSync(filePath, 'utf8'));
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

export function raw() {
	return config;
}

export function get(value, defaultResult) {
	return lodashGet(config, value, defaultResult);
}

export const refreshing = () => _refreshing;

export const _refresh = async () => {
	_refreshing = true;
	const response = loadConfig();
	_refreshing = false;
	return response;
};

loadConfig();
