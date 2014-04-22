'use strict';

var config = require('./../config/config'),
	constants = require('./../config/constants'),
	repository = require('./../config/repository'),
	querystring = require('querystring');

module.exports = function(req, res, next){
	if(req.options.host === config.api_domains.auth.options.host && req.method === 'GET' &&
		(req.options.path === '/users' || req.options.path.substr(0, 7) === '/users?')){
		if(req.cookies.hasOwnProperty(constants.AUTH_ACCESS_TOKEN_NAME)){
			var token = req.cookies[constants.AUTH_ACCESS_TOKEN_NAME];
			repository.get(token).then(function(value){ // on success
				try{
					var user_data = JSON.parse(value);
					var user_id = user_data.user_id;

					if (req.query['no-cache']) {
						// make request with user id
						req.options.path = '/users/' + user_id;
					} else {
						req.body = {
							refresh_token: user_data.refresh_token,
							grant_type: constants.AUTH_REFRESH_TOKEN_NAME
						};
						// Return user data from /oauth/token endpoint (workaround for /users/{id} requiring critical elevation):
						// todo rebuild options from existing object in config
						req.options = config.api_domains.auth.options;
						req.options.path = constants.REFRESH_TOKEN_PATH;
						req.options.method = 'POST';
						req.options.headers = {
							'Content-Type': 'application/x-www-form-urlencoded',
							'Content-Length': Buffer.byteLength(querystring.stringify(req.body))
						};
						req.method = 'POST';
					}
					next();
				} catch(e) {
					// error retrieving valid data from redis database, continue original request
					res.clearCookie(constants.AUTH_ACCESS_TOKEN_NAME, { path: '/api' });
					next();
				}
			}, function(){ // on error
				// error connecting to redis, continue request
				res.clearCookie(constants.AUTH_ACCESS_TOKEN_NAME, { path: '/api' });
				next();
			});
		} else {
			next();
		}
	} else {
		next();
	}
};