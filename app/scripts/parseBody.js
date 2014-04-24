'use strict';

var querystring = require('querystring');

module.exports = function(req, res, next){
	if((req.method === 'POST' || req.method === 'PATCH') && req.body){
		req.body = querystring.stringify(req.body);
	}
	next();
};