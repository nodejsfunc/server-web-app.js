'use strict';

var express = require('express'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	logger = require('morgan'),
	port = process.env.PORT || 3000,
	global = require('./config/global'),
	config = require('./config/config1'),
	powered = require('./middleware/powered'),
	requested = require('./middleware/requested'),
	routes = {
		local: require('./routes/local'),
		auth: require('./routes/auth')
	};

// Configure application
var app = express();
app.use(bodyParser());
app.use(cookieParser());
app.use(logger('dev'));
app.use(powered);
app.use(requested);

// Register routes
app.use(global.LOCAL_PATH, routes.local);
for(var domain in config.api_domains){
	if(routes[domain]){
		app.use('/api/'+domain, routes[domain]);
	}
}

// Start server
app.listen(port);
console.log('Express server listening on port ' + port);