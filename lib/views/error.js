const escape = require('../utils/escape');

const layout = require('./layout');

function error({message, error}) {
	return `
		<h1>${escape(message)}</h1>
		<pre class='left'>${escape(error.stack)}</pre>
	`;
}

module.exports = function proxyError(context) {
	return layout(error(context), context);
};
