'use strict';

var config = require('./../config/config');

module.exports = function(req, res, next){
	if(!config.api_domains.hasOwnProperty(req.params.domain)){
		res.send(404);
	} else {
		next();
	}
};