'use strict';

module.exports = function(req, res, next) {
	// Require config here so it reflects invalidation of the require cache on SIGHUP:
	var config = require('./../config/config');
	if (!config.domains[req.params.domain]) {
		res.send(404);
	} else {
		next();
	}
};