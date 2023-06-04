import createDebug from 'debug';
import makeKnex from 'knex/knex.js';
import * as config from '../config.js';

const debug = createDebug('vikas-auth:db-init');

const db = config.get('db');
if (db.client === 'sqlite3') {
	debug('Using database', db.connection.filename);
}

/** @type {import('knex').Knex} */
export const knex = makeKnex(db);
