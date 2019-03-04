const knex = require('knex');

module.exports = function loadDatabase() {
	const config = require('../config');
	return knex(config.config.db);
};
