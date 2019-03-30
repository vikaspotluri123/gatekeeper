const {minify, escape} = require('../utils');
const layout = require('./layout');

const loggedOutUserTemplate = minify(`
	<p>You are not logged in</p>
	<a class="btn" href="/login">Log In</a>
`);

const loggedInTemplate = minify(`
	<p>You're logged in as <span class="emph">{user}</span></p>
	<form method="POST" action="/logout">
		<input class="btn ptr" type="submit" value="Log Out" />
	</form>
`);

const template = minify(`
	<h1>{name}</h1>
	{context}
`);

function index({name, user}) {
	const contextText = user ? loggedInTemplate.replace('{user}', escape(user)): loggedOutUserTemplate;
	return template.replace('{name}', escape(name)).replace('{context}', contextText);
}

module.exports = function proxyIndex(context) {
	return layout(index(context), context);
};
