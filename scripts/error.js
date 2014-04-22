'use strict';

module.exports = function(err, req, res, next){
	console.log(err);
	if(err.timeout){
		res.statusCode = 504;
		res.end('timeout of ' + err.timeout + 'ms exceeded');
	}
};