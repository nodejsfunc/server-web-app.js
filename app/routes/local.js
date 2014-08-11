'use strict';

var express = require('express'),
	constants = require('./../config/constants'),
	config = require('./../config/config'),
	repository = require('./../util/repository'),
	logger = require('./../util/logger'),
	router = express.Router();

var auth = require('./../services/auth');

router
	.get(constants.SIGN_OUT_PATH, function (req, res) {
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
        req._userId = data.user_id;
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
	.get(constants.CLIENT_CONFIG_PATH, function (req, res) {
		res.send(200, config.clientConfig);
	})
	.post(constants.LOG_PATH, function (req, res) {
		var timestamp = Date.now(),
				startDate = new Date(timestamp),
				data = req.body;
		if (!data || !data.message) {
			throw(new Error('Missing log message.'));
		}
		if (data.level && typeof logger[data.level] !== 'function') {
			throw(new Error('Invalid log level: ' + data.level));
		}
		if (!data.level) {
			data.level = 'error'; // Default logging level for CWA logs
		}
		res.send(200);
		logger[data.level](String(data.message), {
			appName: 'CWA',
			timestamp: timestamp,
			datetime: startDate,
			httpUserAgent: req.headers['user-agent'],
			httpClientIP: req.ip || req._remoteAddress || (req.connection && req.connection.remoteAddress),
			httpVia: req.headers.via,
			httpXForwardedFor: req.headers['x-forwarded-for'],
			stack: data.stack
		});
	});

module.exports = router;
