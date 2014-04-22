'use strict';

var express = require('express'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	timeout = require('connect-timeout'),
	logger = require('morgan'),
	port = process.env.PORT || 3000,
	constants = require('./config/constants'),
	config = require('./config/config1'),
	middleware = require('./scripts'),
	routes = require('./routes');

// Configure application
var app = express();

app.enable('trust proxy'); // required for nginx
app.use(bodyParser());
app.use(cookieParser());
app.use(logger('dev'));
app.use(timeout(config.api_timeout * 1000));
app.use(middleware.powered);
app.use(middleware.requested);

// Register routes
app.use(constants.LOCAL_PATH, routes.local);
app.use(constants.BASE_PATH, routes.services);
app.use(middleware.error);

// Start server
app.listen(port);
console.log('Express server listening on port ' + port);