'use strict';

var express = require('express'),
	global = require('./../config/global'),
	config = require('./../config/config1'),
	repository = require('./../config/repository'),
	router = express.Router(),
	http = require('http'),
	https = require('https');

// todo make this general :service/:path
router.get('/:path', function(req, res){
	var options = config.api_domains.auth.options;
	options.path = req.params.path;

	// todo make this common to all requests
	// Build proxy request headers by copying across request headers from client request
	var headers = {};
	for(var header in req.headers) {
		if (req.headers.hasOwnProperty(header)) {
			if (!options.hasOwnProperty(header)) {
				if (header !== 'cookie') {   // don't copy across cookies
					headers[header] = req.headers[header];
				}
			}
		}
	}

	// Add origin header if missing, as it's not set by Firefox/IE for same-domain requests,
	// but required for the services API:
	if (!headers.origin) {
		headers.origin = req.protocol + '://' + req.headers.host;
	}

	// if present, translate access_token cookie to OAuth2 Authorisation header with bearer token
	// NOTE: the node app may be communicating with services behind the same firewall or on a different domain entirely (as is the case with nodejs-internal)
	// so we don't want to add the OAUTH2 header if communicating on port 80
	if (req.cookies.hasOwnProperty(global.AUTH_ACCESS_TOKEN_NAME) && options.port !== 80) {
		headers.Authorization = 'Bearer '+ req.cookies[global.AUTH_ACCESS_TOKEN_NAME];
	}

	options.headers = headers;
	options.method = req.method; // make the proxy request use the same verb as the client request

	console.log(options);

	// Make the proxy HTTP request
	var proxy_scheme = options.port === 443 ? https : http;

	// make proxy request

	res.json();
});

module.exports = router;