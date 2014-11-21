'use strict';


var express = require('express'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	timeout = require('connect-timeout'),
	port = process.env.PORT || 3000,
	constants = require('./app/config/constants'),
	config = require('./app/config/config'),
	middleware = require('./app/scripts'),
	routes = require('./app/routes'),
	logger = require('./app/util/logger');

process.on('SIGINT', function() {
	logger.notice('SIGINT received. Express server shutting down');
	process.exit();
});


process.on('exit', function(code){
	logger.warn('Node.js server exiting with error code: ' + code);
});


// Configure application
var app = express();

app.enable('trust proxy'); // required for nginx
app.use(middleware.requestLogger);
app.use(middleware.csrfHeader);
app.use(middleware.poweredByHeader);
app.use(bodyParser());
app.use(cookieParser());
app.use(timeout((config.timeout || 10) * 1000));

// Register routes
app.use(constants.LOCAL_PATH, routes.local);
app.use(constants.BASE_PATH, routes.services);
app.use(middleware.notFound);
app.use(middleware.error);

// Third party integrations
if (config.newRelicKey) {
	require('newrelic');
}


// Start server
app.listen(port);
logger.notice('Express server listening on port ' + port);
