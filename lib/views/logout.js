const escape = require('../utils/escape');
const layout = require('./layout');

function alreadyAuthenticated({email, name}) {
	const emailText = email ? ` as <span class="emph">${escape(email)}</span>` : '';
	return `
		<h1>${escape(name)}</h1>
		<p>You are logged in${emailText}. Are you sure you want to log out?</p>
		<form method="POST" action="/logout">
			<input type="submit" class="btn ptr green" value="Yes, log me out">
		</form>
	`;
}

module.exports = function proxyAlreadyAuthenticated(context) {
	return layout(alreadyAuthenticated(context), context);
};
