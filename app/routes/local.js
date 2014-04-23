'use strict';

var express = require('express'),
	constants = require('./../config/constants'),
	config = require('./../config/config'),
	repository = require('./../util/repository'),
	router = express.Router();

router
	.get(constants.SIGN_OUT_PATH, function(req, res){
		var access_token = req.cookies[constants.AUTH_ACCESS_TOKEN_NAME];

		// delete token from redis repository
		repository.del(access_token);

		// delete cookie in browser
		res.clearCookie(constants.AUTH_ACCESS_TOKEN_NAME, { path: '/api' });

		res.send(200, null);
		res.end();
	})
	.get(constants.CLIENT_CONFIG_PATH, function(req, res){
		res.send(200, config.clientConfig);
		res.end();
	});

module.exports = router;