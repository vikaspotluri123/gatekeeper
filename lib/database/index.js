let knex;
let init;

module.exports = {
	get knex() {
		if (!knex) {
			knex = require('./knex')();
		}

		return knex;
	},
	get init() {
		if (!init) {
			init = require('./init');
		}

		return init;
	}
};
