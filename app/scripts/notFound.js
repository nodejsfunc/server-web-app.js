
'use strict';

var constants = require('../config/constants');

module.exports = function(req, res){
	var response = JSON.stringify({ code: 404, error: '404 Not found' });
	res.setHeader('X-Powered-By', constants.APP_NAME + constants.APP_VERSION);
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Content-Length', Buffer.byteLength(response));
	res.send(404, response);
};