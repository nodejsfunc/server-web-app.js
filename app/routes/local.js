'use strict';

var express = require('express'),
	constants = require('./../config/constants'),
	config = require('./../config/config'),
	repository = require('./../util/repository'),
	router = express.Router();

var auth = require('./../services/auth');

router
	.get(constants.SIGN_OUT_PATH, function(req, res){

		var access_token = req.cookies[constants.AUTH_ACCESS_TOKEN_NAME];

    if (access_token === undefined) {
      res.send(400, {error: 'We need the access token cookie to be set.'});
    }

    repository.get(access_token).then(function(data){

      try {

        data = JSON.parse(data);

        auth.revokeRefreshToken(data.refresh_token).then(function(){

          repository.del(access_token);

          res.clearCookie(constants.AUTH_ACCESS_TOKEN_NAME, { path: '/api' });

          res.send(200, null);

        }, function(e){

          res.send(500, e);

        });

      } catch(e) {

        res.clearCookie(constants.AUTH_ACCESS_TOKEN_NAME, { path: '/api' });

        res.send(200, null);

      }

    }, function(){

      res.send(500);

    });

	})
	.get(constants.CLIENT_CONFIG_PATH, function(req, res){
		res.send(200, config.clientConfig);
	});

module.exports = router;