'use strict';

var config = require('./../config/config'),
	constants = require('./../config/constants'),
	repository = require('./../util/repository'),
	extend = require('extend'),
	querystring = require('querystring');

module.exports = function(req, res, next){
	if(req.options.host === config.api_domains.auth.options.host && req.method === 'GET' &&
		(req.options.path === '/users' || req.options.path.substr(0, 7) === '/users?')){
		// accessing the users service
		if(req.cookies.hasOwnProperty(constants.AUTH_ACCESS_TOKEN_NAME)){
			var token = req.cookies[constants.AUTH_ACCESS_TOKEN_NAME];
			repository.get(token).then(function(value){ // on success
				try{
					var user_data = JSON.parse(value);
					var user_id = user_data.user_id;
					var expires = user_data.expires;

					if (req.query['no-cache']) {
						// make request with user id
						req.options.path = '/users/' + user_id;
					} else {
						var post_data = {
							refresh_token: user_data.refresh_token,
							grant_type: constants.AUTH_REFRESH_TOKEN_NAME
						};
						if (expires) {
							post_data[constants.AUTH_PARAM_REMEMBER_ME] = 'true';
						}
						req.body = querystring.stringify(post_data);
						// Return user data from /oauth/token endpoint (workaround for /users/{id} requiring critical elevation):
						req.options = extend(true, {}, config.api_domains.auth.options);
						req.options.path = constants.REFRESH_TOKEN_PATH;
						req.options.method = 'POST';
						req.options.headers = {
							'Content-Type': 'application/x-www-form-urlencoded',
							'Content-Length': Buffer.byteLength(req.body)
						};
						req.method = 'POST';
					}
					next();
				} catch(e) {
					// error retrieving valid data from redis database
					res.clearCookie(constants.AUTH_ACCESS_TOKEN_NAME, { path: '/api' });
					res.set('www-authenticate', constants.INVALID_TOKEN);
					res.send(401);
				}
			}, function(){ // on error
				// error connecting to redis
				res.clearCookie(constants.AUTH_ACCESS_TOKEN_NAME, { path: '/api' });
				res.set('www-authenticate', constants.INVALID_TOKEN);
				res.send(401);
			});
		} else {
			// missing authentication token
			res.set('www-authenticate', constants.INVALID_TOKEN);
			res.send(401);
		}
	} else {
		// not accessing the users service, continue the request as is
		next();
	}
};