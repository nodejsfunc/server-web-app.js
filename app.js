'use strict';

/* globals global */

/**
 * Module dependencies.
 */
var express = require('express'),
  common = require('./routes/common'),
  path = require('path'),
  http = require('http'),
  https = require('https'),
  querystring = require('querystring');


// Global variables
global.http = http;
global.https = https;
global.querystring = querystring;
// Paths
global.servicesPath = __dirname + '/public/javascripts/services.js';
global.repositoryPath = __dirname + '/public/javascripts/repository.js';

var app = express();

/**
 * Environment config specific variables
 */
require('./config/config.js');

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
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Error handling (400, 500)
 */
//404 Error handling
app.use(function(req, res){
  var response = { code: 404, error: '404 Not found' };
  res.setHeader('X-Powered-By', global.app_name + global.app_version);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', response.length);
  res.send(404, JSON.stringify(response));
});

//500 Error handling
app.use(function(err, req, res){
  var response = { code: 500, error: '500 Oh oh! something broke!' };
  res.setHeader('X-Powered-By', global.app_name + global.app_version);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', response.length);
  res.send(500, JSON.stringify(response));
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