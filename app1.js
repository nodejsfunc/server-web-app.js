'use strict';

var express = require('express'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	logger = require('morgan'),
	port = process.env.PORT || 3000,
	global = require('./config/global'),
	config = require('./config/config1'),
	routes = {
		local: require('./routes/local'),
		auth: require('./routes/auth')
	};

// Configure application
var app = express();
app.use(bodyParser());
app.use(cookieParser());
app.use(logger('dev'));
app.use(function(req, res, next){
	res.setHeader('X-Powered-By', global.APP_NAME + global.APP_VERSION);
	next();
});
app.use(function(req, res, next){
	if (req.headers['x-requested-by'] !== 'blinkbox') {
		res.send(403);
	} else {
		next();
	}
});

// Register routes
app.use(global.LOCAL_PATH, routes.local);
for(var domain in config.api_domains){
	console.log(domain);
	if(routes[domain]){
		app.use(domain, routes[domain]);
	}
}

// Start server
app.listen(port);
console.log('Express server listening on port ' + port);