
const express = require('express');
const app = express();

// Configure passport
require('./passport');

// Add middleware
require('./bootstrap')(app);

// Add routes
require('./router')(app);

module.exports = app;
