'use strict';

var constants = require('./../config/constants');

module.exports = function(req, res, next){
	res.setHeader('X-Powered-By', constants.APP_NAME + constants.APP_VERSION);
	next();
};