'use strict';

var express = require('express'),
	constants = require('./../config/constants'),
	repository = require('./../util/repository'),
	logger = require('./../util/logger'),
	router = express.Router();

var auth = require('./../services/auth');

router
	// Generate a random number, send it to redis, make sure we can get it back again, then clean up and make sure it's gone.
	.get(constants.HEALTHCHECK_PATH, function (req, res) {

		try {
			// Set our key
			var healthcheck_key = "healthcheck_key_" + require("os").hostname();
			var healthcheck_value = Math.random().toString();
			repository.set(healthcheck_key, healthcheck_value);

			// Get our key
			repository.get(healthcheck_key).then(function(reply) {
				var response_healthcheck_value = reply.toString();
				if (response_healthcheck_value === healthcheck_value) {

					var is_delete_good = false;
					repository.del(healthcheck_key).then(function(reply) {
						repository.get(healthcheck_key).then(function(reply) {
							if (reply === null) {
						// Everything is good
						res.send(200, {
							status: "OK",
							value_in: healthcheck_key,
							key_in: healthcheck_value,
							key_out: response_healthcheck_value,
						});
							}
						});
					});

				} else {
					// Something went wrong.
					res.send(503, {
						// This purposefully not mentioning "redis" as this healthcheck is passed to the front
						status: "Bad response from data source."
					});
				}
			}, function (err) {
				res.send(503, {
					status: "Error: " + err
				});
			});
		} catch(error) {
			res.send(503);
			// Send errors to log
		}

 	})
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
	.get(constants.CLIENT_CONFIG_PATH, function (req, res) {
		// Require client config here so it reflects invalidation of the require cache on SIGHUP:
		var config = require('./../config/config');
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
