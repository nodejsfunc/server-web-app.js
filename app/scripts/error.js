'use strict';

module.exports = function(err, req, res, next){
	if(!err){
		return next();
	} else if(err.timeout){
		res.statusCode = 504;
		res.end('timeout of ' + err.timeout + 'ms exceeded');
	}
};