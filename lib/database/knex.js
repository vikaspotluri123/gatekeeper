const knex = require('knex');
const config = require('../config');

module.exports = function loadDatabase() {
	return knex(config.config.db);
};
