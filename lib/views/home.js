const escape = require('../utils/escape');
const layout = require('./layout');

const loggedOutUserTemplate = `
	<p>You are not logged in</p>
	<a class="btn" href="/login">Log In</a>
`;

function index({name, user}) {
	const contextText = user ? `
		<p>You're logged in as <span class="emph">${escape(user)}</span></p>
		<a class="btn" href="/logout">Log Out</a>
	` : loggedOutUserTemplate;
	return `
		<h1>${escape(name)}</h1>
		${contextText}
	`;
}

module.exports = function proxyIndex(context) {
	return layout(index(context), context);
};
