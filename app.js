'use strict';


var express = require('express'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	timeout = require('connect-timeout'),
	path = require('path'),
	port = process.env.PORT || 3000,
	constants = require('./app/config/constants'),
	// New Relic and timeout config will not be refreshed on require cache invalidation:
	config = require('./app/config/config'),
	middleware = require('./app/scripts'),
	routes = require('./app/routes'),
	logger = require('./app/util/logger');

// Allow configuration reload on SIGHUP, see:
// http://jira.blinkbox.local/jira/browse/SWA-74
process.on('SIGHUP', function () {
	logger.notice('Express server configuration reload');
	// Clear the config from require cache:
	delete require.cache[path.resolve('./app/config/config.json')];
});

process.on('SIGINT', function () {
	logger.notice('Express server shutting down');
	process.exit();
});

process.on('exit', function (code) {
	if (code) {
		logger.warn('Node.js server exiting with error code: ' + code);
	}
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
