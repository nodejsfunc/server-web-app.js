'use strict';

var express = require('express'),
	constants = require('./../config/constants'),
	repository = require('./../util/repository'),
	logger = require('./../util/logger'),
	router = express.Router();

var auth = require('./../services/auth');

router
	.get(constants.SIGN_OUT_PATH, function (req, res) {
		var access_token = req.cookies[constants.AUTH_ACCESS_TOKEN_NAME];
		if (!access_token) {
			// User doesn't have access token, so is likely already logged out:
			res.send(200);
			return;
		}
		function clearDataHandler() {
			repository.del(access_token);
			res.clearCookie(constants.AUTH_ACCESS_TOKEN_NAME, { path: '/api' });
			res.send(200);
		}
		function errorHandler(err) {
			logger.error(err);
			clearDataHandler();
		}
		repository.get(access_token).then(function (data) {
			var obj;
			try {
				obj = JSON.parse(data);
			} catch (err) {
				errorHandler(err);
			}
			if (obj) {
				req._userId = obj.user_id;
				auth.revokeRefreshToken(obj.refresh_token).then(clearDataHandler, errorHandler);
			} else {
				clearDataHandler();
			}
		}, errorHandler);
	})
	// LOG API to log to Graylog from CWA:
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
	})
	// Generate a random number, send it to redis, make sure we can get it back again, then clean up and make sure it's gone.
	.get(constants.HEALTHCHECK_PATH, function (req, res) {
		var healthcheck_key = 'healthcheck_key_' + require('os').hostname();
		var healthcheck_value = Math.random().toString();
		repository.set(healthcheck_key, healthcheck_value).then(function () {
			repository.get(healthcheck_key).then(function(result) {
				if (result === healthcheck_value) {
					repository.del(healthcheck_key).then(function() {
						repository.exists(healthcheck_key).then(function(reply) {
							if (!reply) {
								res.send(200, {
									status: 'OK'
								});
							} else {
								var message = 'Key was not deleted from data source.';
								logger.error('Health check error: ' + message);
								res.send(503, {
									status: 'Error',
									message: message
								});
							}
						});
					}, function (err) {
						logger.error(err);
						res.send(503, {
							status: 'Error',
							message: 'Failed to delete key from data source.'
						});
					});
				} else {
					var message = 'Bad response from data source.';
					logger.error('Health check error: ' + message);
					res.send(503, {
						status: 'Error',
						message: message
					});
				}
			}, function (err) {
				logger.error(err);
				res.send(503, {
					status: 'Error',
					message: 'Failed to retrieve response from data source.'
				});
			});
		}, function (err) {
			logger.error(err);
			res.send(503, {
				status: 'Error',
				message: 'Failed to store key in data source.'
			});
		});
	});

module.exports = router;
