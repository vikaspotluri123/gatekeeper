import createDebug from 'debug';
import express from 'express';
import {initializePassport} from './express/passport.js';
import {bootstrapExpress} from './express/bootstrap.js';
import {setupRoutes} from './express/routes.js';
import {setupDb} from './database/index.js';

const debug = createDebug('vikas-auth:setup');

/**
 * @param {import('./config/types.ts').UserFromRequestFunction} [altGetUserFromRequest]
 *  an optional function that can be used to override the default behaviour of getting the user from the request
 */
export async function createApp(altGetUserFromRequest) {
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
	await setupRoutes(app, altGetUserFromRequest);
	debug('routes added');

	debug('initializing database');
	await setupDb();
	debug('database initialized');

	return app;
}
