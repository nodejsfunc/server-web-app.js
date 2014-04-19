'use strict';

var express = require('express'),
	global = require('./../config/global'),
	// repository = require('./public/javascripts/repository'),
	router = express.Router();

router
	.get(global.SIGN_OUT_PATH, function(req, res){
		var access_token = req.cookies[global.AUTH_ACCESS_TOKEN_NAME];

		// delete token from redis repository
		// global.repository.del(access_token);

		// delete cookie in browser
		res.clearCookie(global.AUTH_ACCESS_TOKEN_NAME, { path: '/api' });

		res.send(200, null);
		res.end();
	})
	.get(global.CLIENT_CONFIG_PATH, function(req, res){
		//res.send(200, global.clientConfig);
		res.send(200, {test: 1});
		res.end();
	});

module.exports = router;