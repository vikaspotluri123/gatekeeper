import {auth, home, apiV1} from '../controllers/index.js';
import * as config from '../config.js';
import {jsonResponse} from '../utils/index.js';
import {tokenSwap} from './middleware.js';

const {noAccess, notFound} = jsonResponse;

/**
 * @param {import('express').Application} app
 * @param {import('../config/types.js').UserFromRequestFunction} [altGetUserFromRequest]
 */
export async function setupRoutes(app, altGetUserFromRequest) {
	const {createGetUser, session, securityHeaders, requireLogin, requireNoLogin} = await import('./middleware.js');
	const getUser = createGetUser(altGetUserFromRequest);
	const requireLoginSafe = [getUser, requireLogin];

	app.use(function isApiRequest(req, _, next) {
		req.isAPIRequest = req.path.startsWith('/api');
		next();
	});

	app.use(securityHeaders);

	// Route the API first
	// HTTP - Authenticate user using cookie and `X-Original-URI` header. Requires CORS
	app.get(
		'/api/v1/http',
		apiV1.cors,
		apiV1.http, // Transform the header to a route parameter to align with the REST API
		apiV1.validUrl,
		tokenSwap, // Translate tone-time authentication token to set-cookie header
		getUser,
		apiV1.validateAccess,
		requireLogin,
		noAccess,
	);

	// REST - Authenticate user using cookie and inline URL. Does not use CORS
	// The asterisk needs to be added since the url will contain `/`s
	app.get('/api/v1/rest/:url(*)', ...requireLoginSafe, apiV1.validUrl, apiV1.validateAccess, noAccess);

	// Swap token for cookie
	app.get('/api/v1/token/:token', apiV1.token, notFound);

	// Authentication endpoint - external domains request user authentication
	app.get('/api/v1/authenticate/', session, apiV1.authenticate, apiV1.sendToken);

	// Refresh config - allows updates to rules without restarting app
	app.get('/api/v1/update-config', ...requireLoginSafe, apiV1.refreshConfig, noAccess);

	app.use(function addAppNameToContext(_req, res, next) {
		res.locals.name = config.get('name', 'Shared Authentication');
		next();
	});

	app.get('/', session, home);
	app.get('/logout', ...requireLoginSafe, (_, res) => res.render('logout'));
	app.post('/logout', ...requireLoginSafe, auth.terminate);
	app.get('/login', getUser, requireNoLogin, auth.outgoing);
	app.get('/login/callback', getUser, requireNoLogin, auth.incoming, apiV1.sendToken, auth.redirect);

	// Catch 404 and forward to error handler
	app.use((req, res, next) => {
		// The API uses JSON responses
		if (req.isAPIRequest) {
			return notFound(null, res);
		}

		/** @type {any} */
		const err = new Error('Not Found');
		err.status = 404;
		next(err);
	});

	// Error handler
	app.use((error, req, res, _) => {
		console.error(error.stack);
		if (error.status) {
			console.error(`Path: ${req.path}, Status Code: ${error.status}`);
		}

		const {status = 500} = error;
		if (req.isAPIRequest) {
			return res.status(status).json({
				type: 'error',
				message: error.message,
				code: status,
			});
		}

		// Set locals, only providing error in development
		res.locals.message = error.message;
		res.locals.error = config.get('env') === 'development' ? error : {};

		// Render the error page
		res.status(status);
		res.render('error');
	});
}
