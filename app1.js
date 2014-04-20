'use strict';

var express = require('express'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	logger = require('morgan'),
	port = process.env.PORT || 3000,
	global = require('./config/global'),
	config = require('./config/config1'),
	middleware = require('./middleware'),
	routes = require('./routes');

// Configure application
var app = express();

app.enable('trust proxy'); // required for nginx
app.use(bodyParser());
app.use(cookieParser());
app.use(logger('dev'));
app.use(middleware.powered);
app.use(middleware.requested);

// Register routes
app.use(global.LOCAL_PATH, routes.local);
app.use('/api', routes.services);

// Start server
app.listen(port);
console.log('Express server listening on port ' + port);