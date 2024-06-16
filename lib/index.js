import createDebug from 'debug';
import express from 'express';
import {initializePassport} from './express/passport.js';
import {bootstrapExpress} from './express/bootstrap.js';
import {setupRoutes} from './express/routes.js';
import {setupDb} from './database/index.js';

const debug = createDebug('vikas-auth:setup');

export async function createApp() {
	const app = express();

	// Configure passport
	debug('initializing passport');
	initializePassport();
	debug('passport initialized');

	// Add middleware
	debug('bootstrapping');
	bootstrapExpress(app);
	debug('bootstrapped');

	// Add routes
	debug('adding routes');
	await setupRoutes(app);
	debug('routes added');

	debug('initializing database');
	await setupDb();
	debug('database initialized');

	return app;
}
