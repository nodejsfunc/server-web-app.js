'use strict';

module.exports = function(req, res, next){
	if (req.headers['x-requested-by'] !== 'blinkbox') {
		res.send(403);
	} else {
		next();
	}
};