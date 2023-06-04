import createDebug from 'debug';
import {v1 as api} from "../api/index.js";
import {knex} from './knex.js';

const debug = createDebug('vikas-auth:db-init');

/** @type {NodeJS.Timer} */
let timer;

async function runCleanup() {
	clearTimeout(timer);
	debug('cleaning up expired tokens');
	await api.token.cleanup().catch(error =>
		console.warn('failed removing expired tokens', error)
	);
	debug('cleaned up expired tokens');
	timer = setTimeout(runCleanup, 1000 * 60 * 60 * 12).unref();
}

// TABLE: token->cookie
const tableExists = await knex.schema.hasTable('tokens');
if (!tableExists) {
	debug('table `tokens` does not exist, creating.');
	await knex.schema.createTable('tokens', table => {
		table.string('token').primary().notNullable().unique();
		table.string('cookie').notNullable().unique();
		table.timestamp('created').notNullable();
	});
	debug('done creating table `tokens`');
}

await runCleanup();
