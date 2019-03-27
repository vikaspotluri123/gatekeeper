const {auth, home, apiV1} = require('../controllers');
const config = require('../config');
const {noAccess, notFound} = require('../utils').jsonResponse;
const mw = require('./middleware');

module.exports.init = function route(app) {
	const {apiRequireLogin: apiLogin, requireLogin, requireLogout, session} = mw;

	// Route the API first
	app.get('/api/v1/http', apiLogin, apiV1.cors, apiV1.http, apiV1.validateAccess, noAccess);

	// With "HEAD" requests only 2xx, 401 and 403 response codes are allowed
	app.use('/api/v1/http', apiLogin, apiV1.cors, noAccess);

	// The asterisk needs to be added since the url will contain `/`s
	app.get('/api/v1/rest/:url(*)', apiLogin, apiV1.validUrl, apiV1.validateAccess, noAccess);

	// Swap token for cookie
	app.get('/api/v1/token/:token', apiV1.token, notFound);

	// Create token request
	app.get('/api/v1/authenticate/', session, apiV1.authenticate, apiV1.sendToken);

	// Refresh config
	app.get('/api/v1/update-config', apiLogin, apiV1.refreshConfig, noAccess);

	app.use(function addAppNameToContext(req, res, next) {
		res.locals.name = config.get('name', 'Shared Authentication');
		next();
	});

	app.get('/', session, home);
	app.get('/logout', requireLogin, auth.terminate);
	app.get('/login', requireLogout, auth.outgoing);
	app.get('/login/callback', requireLogout, auth.incoming, apiV1.sendToken, auth.redirect);

	// Catch 404 and forward to error handler
	app.use((req, res, next) => {
		// The API uses JSON responses
		if (req.path.startsWith('/api')) {
			return notFound(null, res);
		}

		const err = new Error('Not Found');
		err.status = 404;
		next(err);
	});

	// Error handler
	app.use((error, req, res, _) => {
		console.error(error.stack);
		if (error.status) {
			console.error(`Status Code: ${error.status}`);
		}

		const {status = 500} = error;
		if (req.path.startsWith('/api')) {
			return res.status(status).json({
				type: 'error',
				message: error.message,
				code: status
			});
		}

		// Set locals, only providing error in development
		res.locals.message = error.message;
		res.locals.error = req.app.get('env') === 'development' ? error : {};

		// Render the error page
		res.status(status);
		res.render('error');
	});
};
