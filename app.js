'use strict';

var express = require('express'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	timeout = require('connect-timeout'),
	logger = require('morgan'),
	port = process.env.PORT || 3000,
	constants = require('./app/config/constants'),
	config = require('./app/config/config'),
	middleware = require('./app/scripts'),
	routes = require('./app/routes'),
	bugsense = require('./app/config/bugsense');

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
app.use(middleware.notFound);
app.use(middleware.error);

// Third party integrations
bugsense.register(config.bugsenseKey);
if (config.newRelicKey) {
	require('newrelic');
}

// Start server
app.listen(port);
console.log('Express server listening on port ' + port);
