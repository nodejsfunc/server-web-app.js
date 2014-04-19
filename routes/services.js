'use strict';

var express = require('express'),
	global = require('./../config/global'),
	config = require('./../config/config1'),
	repository = require('./../config/repository'),
	middleware = require('./../middleware'),
	router = express.Router(),
	http = require('http'),
	https = require('https');

router.use('/:domain/*', middleware.domain); // verifies that domain is valid
router.use('/:domain/*', middleware.options); // creates options options to be used for proxy request
router.use('/:domain/*', middleware.reverse); // reverses accept and content-type headers

router.get('/:domain/*', function(req, res){

	console.log(req.options);

	// Make the proxy HTTP request
	var proxy_scheme = req.options.port === 443 ? https : http;

	// make proxy request

	res.send(200);
});

router.post('/:domain/*', function(req, res){

	console.log(req.options);

	// Make the proxy HTTP request
	var proxy_scheme = req.options.port === 443 ? https : http;

	// make proxy request

	res.send(200);
});

module.exports = router;