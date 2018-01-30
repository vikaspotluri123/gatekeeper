const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const google = require('./config').config.google;

if(!google) {
	console.error('Cannot initialize: [Passport]: Google credentials not supplied!');
	process.exit(1);
}

if(!google.clientID || !google.clientSecret || !google.callbackURL) {
	console.warn('Warning: [Passport]: Not providing Client ID, Client Secret, AND Callback URL can create errors');
}

// Testing!
const allowed_emails = [
	'me@vikaspotluri.ml'
];

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user, cb) => cb(null, user));

function verifyCallback(access, refresh, profile, cb) {
	let theEmail;
	profile.emails = profile.emails || [];
	profile.emails.forEach((email) => {
		if(allowed_emails.includes(email.value))
			theEmail = email.value;
	});
	cb(null, theEmail);
}

const strategy = new GoogleStrategy({
	clientID: google.clientID,
	clientSecret: google.clientSecret,
	callbackURL: google.callbackURL
}, verifyCallback);

passport.use(strategy);