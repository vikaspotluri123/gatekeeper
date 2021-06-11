const debug = require('debug')('vikas-auth:db-init');
const knex = require('knex');
const config = require('../config.js');

module.exports = function loadDatabase() {
	const db = config.get('db');
	if (db.client === 'sqlite3') {
		debug('Using database', db.connection.filename);
	}

	return knex(db);
};
