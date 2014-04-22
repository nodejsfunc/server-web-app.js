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
	routes = require('./app/routes');

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
app.use(function(req, res){ // 404 handler
	res.send(404, 'Not found');
});

// Start server
app.listen(port);
console.log('Express server listening on port ' + port);/**
 * Bugsense configuration
 *
 */
global.bugsense = require('./public/javascripts/bugsense');
if (global.bugsenseKey) {
  global.bugsense.setAPIKey(global.bugsenseKey);

  //catch all errors in the application
  process.on('uncaughtException', function (error) {
    global.bugsense.logError(error);
  });
}

/**
 * App specific values (package.json)
 */
var package_json = require('./package.json');
global.app_version = package_json.version;
global.app_name = package_json.name;

/**
 * All environments
 */
app.enable('trust proxy');   // this allows as to use https - FTM: "When the "trust proxy" setting is enabled the "X-Forwarded-Proto" header field will be trusted.""
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.urlencoded());
app.use(express.json());
app.use(express.cookieParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Error handling (400, 500)
 */
//404 Error handling
app.use(function(req, res){
  var response = JSON.stringify({ code: 404, error: '404 Not found' });
  res.setHeader('X-Powered-By', global.app_name + global.app_version);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', Buffer.byteLength(response));
  res.send(404, response);
});

//500 Error handling
app.use(function(err, req, res){
  var response = JSON.stringify({ code: 500, error: '500 Oh oh! something broke!' });
  res.setHeader('X-Powered-By', global.app_name + global.app_version);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', Buffer.byteLength(response));
  res.send(500, response);
});

/**
 * Includes
 */
// Config files
require(global.repositoryPath);
require(global.servicesPath);

// Route files
// GET
app.get('*', common.index);
// POST
app.post('*', common.index);
// PATCH
app.patch('*', common.index);
// DELETE
app.delete('*', common.index);

/**
 * Load server in provided port
 */
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});