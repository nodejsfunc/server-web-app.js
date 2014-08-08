'use strict';

var express = require('express'),
	constants = require('./../config/constants'),
	config = require('./../config/config'),
	repository = require('./../util/repository'),
	logger = require('./../util/logger'),
	router = express.Router();

var auth = require('./../services/auth');

router
	.get(constants.SIGN_OUT_PATH, function(req, res){
		var access_token = req.cookies[constants.AUTH_ACCESS_TOKEN_NAME];
    if (!access_token) {
	    res.set('www-authenticate', constants.NO_TOKEN);
	    res.send(401);
	    return;
    }
		function errorHandler(err) {
			res.clearCookie(constants.AUTH_ACCESS_TOKEN_NAME, { path: '/api' });
			res.send(500);
			logger.error(err);
		}
    repository.get(access_token).then(function (data) {
      try {
        data = JSON.parse(data);
        auth.revokeRefreshToken(data.refresh_token).then(function () {
          repository.del(access_token);
          res.clearCookie(constants.AUTH_ACCESS_TOKEN_NAME, { path: '/api' });
          res.send(200);
        }, errorHandler);
      } catch (err) {
	      errorHandler(err);
      }
    }, errorHandler);
	})
	.get(constants.CLIENT_CONFIG_PATH, function(req, res){
		res.send(200, config.clientConfig);
	});

module.exports = router;
