'use strict';

var constants = require('../config/constants')

module.exports = function(err, req, res, next){
	if(!err){
		return next();
	} else if(err.timeout){
		res.statusCode = 504;
		res.end('timeout of ' + err.timeout + 'ms exceeded');
	} else {
		var response = JSON.stringify({ code: 500, error: '500 Oh oh! something broke!' });
		res.setHeader('X-Powered-By', constants.APP_NAME + constants.APP_VERSION);
		res.setHeader('Content-Type', 'application/json');
		res.setHeader('Content-Length', Buffer.byteLength(response));
		res.send(500, response);
	}
};