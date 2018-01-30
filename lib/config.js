'use strict';

const environment = process.env.NODE_ENV || 'development';
const filePath = require.resolve(`../config.${environment}.json`);

let config = require(filePath);

module.exports = {
	get config() {
		return config;
	},
	set config(val) {
		return false;
	},
	_refresh: () => config = require(filePath)
}