const app = require('./lib');
const debug = require('debug')('auth.vikaspotluri.ml:server');
const http = require('http');
const config = require('./lib/config').config;

const port = normalizePort(process.env.PORT || config.port|| '3000');

app.set('port', port);
app.listen(port, () => console.log('Listening on port', port));
app.on('error', onError);
app.on('listening', onListening);

function normalizePort(val) {
	const port = parseInt(val, 10);

	if (isNaN(port)) {
		return val;
	}

	if (port >= 0) {
		return port;
	}

	return false;
}

function onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	let bind = (typeof port === 'string' ? 'Pipe ' : 'Port ') + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
	case 'EACCES':
		console.error(bind + ' requires elevated privileges');
		process.exit(1);
		break;
	case 'EADDRINUSE':
		console.error(bind + ' is already in use');
		process.exit(1);
		break;
	default:
		throw error;
	}
}

function onListening() {
	const addr = server.address();
	const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
	console.log('Listening on ' + bind);
}
