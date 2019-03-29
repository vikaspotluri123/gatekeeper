const escape = require('../utils/escape');

const layout = require('./layout');

function error({message, error}) {
	const stack = error && error.stack ? `
		<pre class='left'>${escape(error.stack)}</pre>
	` : '';
	return `
		<h1>${escape(message)}</h1>
		${stack}
	`;
}

module.exports = function proxyError(context) {
	return layout(error(context), context);
};
