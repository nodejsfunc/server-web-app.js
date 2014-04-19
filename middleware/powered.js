'use strict';

var global = require('./../config/global');

module.exports = function(req, res, next){
	res.setHeader('X-Powered-By', global.APP_NAME + global.APP_VERSION);
	next();
};