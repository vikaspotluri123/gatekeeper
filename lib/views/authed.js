const escape = require('../utils/escape');
const layout = require('./layout');

function alreadyAuthenticated({email, name}) {
	const emailText = email ? ` as <span class="emph">${escape(email)}</span>` : '';
	return `
		<h1>${escape(name)}</h1>
		<p>You're already authenticated${emailText}.</p>
		<a href="/logout" class="btn">Logout?</a>
	`;
}

module.exports = function proxyAlreadyAuthenticated(context) {
	return layout(alreadyAuthenticated(context), context);
};
