'use strict';

var express = require('express'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	logger = require('morgan'),
	port = process.env.PORT || 3000,
	global = require('./config/global'),
	local = require('./routes/local');

// Configure application
var app = express();
app.use(bodyParser());
app.use(cookieParser());
app.use(logger('dev'));
app.use(function(req, res, next){
	res.setHeader('X-Powered-By', global.APP_NAME + global.APP_VERSION);
	next();
});

// Register routes
app.use(global.LOCAL_PATH, local);

// Start server
app.listen(port);
console.log('Express server listening on port ' + port);