'use strict';

var logger = require('./../util/logger'),
		config = require('./../config/config');

module.exports = function (err, req, res, next) {
	if (!err) {
		return next();
	} else if (err.timeout) {
		res.send(504);
	} else {
		res.send(500);
	}
	logger.critical(err);
	if (config.newRelicKey) {
		require('newrelic').noticeError(err);
	}
};
