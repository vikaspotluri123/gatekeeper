let knex;
let init;

module.exports = {
	get knex() {
		if (!knex) {
			knex = require('./knex.js')();
		}

		return knex;
	},
	get init() {
		if (!init) {
			init = require('./init.js');
		}

		return init;
	}
};
