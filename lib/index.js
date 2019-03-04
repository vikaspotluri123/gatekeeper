'use strict';

const debug = require('debug')('vikas-auth:setup');
const express = require('express');

const passport = require('./express/passport');
const bootstrap = require('./express/bootstrap');
const routes = require('./express/routes');
const db = require('./database');

module.exports = async function createApp() {
	const app = express();

	// Configure passport
	debug('initializing passport');
	passport.init();
	debug('passport initialized');

	// Add middleware
	debug('bootstrapping');
	bootstrap.init(app);
	debug('bootstrapped');

	// Add routes
	debug('adding routes');
	routes.init(app);
	debug('routes added');

	debug('initializing database');
	await db.init();
	debug('database initialized');

	return app;
};
