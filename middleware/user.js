'use strict';

var config = require('./../config/config1'),
	global = require('./../config/global'),
	repository = require('./../config/repository'),
	querystring = require('querystring');

module.exports = function(req, res, next){
	if(req.options.host === config.api_domains.auth.options.host && req.method === 'GET' &&
		(req.options.path === '/users' || req.options.path.substr(0, 7) === '/users?')){
		if(req.cookies.hasOwnProperty(global.AUTH_ACCESS_TOKEN_NAME)){
			var token = req.cookies[global.AUTH_ACCESS_TOKEN_NAME];
			repository.get(token).then(function(value){ // on success
				try{
					var user_data = JSON.parse(value);
					var user_id = user_data.user_id;
					var noCache = req.options.path.indexOf('no-cache') !== -1;

					if (!noCache) {
						// todo overriding req param is not necessary, simply make the request and return the result
						req.body = {
							refresh_token: user_data.refresh_token,
							grant_type: global.AUTH_REFRESH_TOKEN_NAME
						};
						// Return user data from /oauth/token endpoint (workaround for /users/{id} requiring critical elevation):
						// todo rebuild options from existing object in config
						req.options = config.api_domains.auth.options;
						req.options.path = global.REFRESH_TOKEN_PATH;
						req.options.method = 'POST';
						req.options.headers = {
							'Content-Type': 'application/x-www-form-urlencoded',
							'Content-Length': Buffer.byteLength(querystring.stringify(req.body))
						};
						req.method = 'POST';
					} else {
						// make request with user id
						req.options.path = '/users/' + user_id;
					}
					next();
				} catch(e) {
					// error retrieving valid data from redis database, continue original request
					res.clearCookie(global.AUTH_ACCESS_TOKEN_NAME, { path: '/api' });
					next();
				}
			}, function(){ // on error
				// error connecting to redis, continue request
				res.clearCookie(global.AUTH_ACCESS_TOKEN_NAME, { path: '/api' });
				next();
			});
		} else {
			next();
		}
	} else {
		next();
	}
};