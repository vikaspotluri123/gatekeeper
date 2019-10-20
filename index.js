const createApp = require('./lib');
const config = require('./lib/config');

async function startServer() {
	const {app} = await createApp();

	const port = process.env.PORT || config.get('port', '3000');

	app.set('port', port);
	app.listen(port, () => console.log('Listening on port', port));

	return app;
}

module.exports = startServer;
module.exports.app = createApp;

if (!module.parent) {
	startServer();
}
