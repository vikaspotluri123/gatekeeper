'use strict';

const path = require('path');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const FileStore = require('session-file-store')(session);

module.exports = function bootstrapExpress(instance) {
	// view engine setup
	instance.set('views', path.join(__dirname, 'views'));
	instance.set('view engine', 'hbs');

	instance.use(logger('dev'));
	instance.use(session({
		secret: 'keyboart',
		resave: true,
		saveUninitialized: true,
		store: new FileStore({})
	}));

	instance.use(passport.initialize());
	instance.use(passport.session());
}