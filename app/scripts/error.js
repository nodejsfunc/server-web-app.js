'use strict';

var logger = require('./../util/logger'),
		// New Relic config will not be refreshed on require cache invalidation:
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
