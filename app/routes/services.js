'use strict';

var express = require('express'),
	constants = require('./../config/constants'),
	config = require('./../config/config'),
	repository = require('./../util/repository'),
	logger = require('./../util/logger'),
	middleware = require('./../scripts'),
	router = express.Router(),
	http = require('http'),
	https = require('https'),
	extend = require('extend'),
	querystring = require('querystring'),
	crypto = require('crypto'),
	path = '/:domain/*';

router
	.use(path, middleware.domain) // verifies that domain is valid
	.use(path, middleware.options) // creates options to be used for proxy request
	.use(path, middleware.reverse) // reverses accept and content-type headers
	.use(path, middleware.user) // handle special case of /users/ requests
	.use(path, function(req, res){
		// Make the proxy HTTP request
    var proxy_scheme = req.options.port === 443 ? https : http;

		// make proxy request
		var _updateAccessToken = function(oldAT, newAT, obj){
			// add semantic version number:
			obj.version = constants.TOKEN_STORAGE_VERSION;

			// delete old access token, if it exists
			repository.del(oldAT);

			// set the access/refresh token in the key/value store
			repository.set(newAT, JSON.stringify(obj));
		};

		var _logProxyRequest = function(request, response) {
			var message, log, logType, timestamp, datetime, appTime, status, url, options;

			options = request.__options;
			timestamp = Date.now();
			datetime = new Date(timestamp);
			appTime = timestamp - request.__start_timestamp;
			status = +response.statusCode;

			// if this is an error, headers is undefined
			response.headers = response.headers || {};

			url = (options.port === 443 ? 'https://' : 'http://') + options.host + ':' + options.port + options.path;

			if (status >= 500) {
				logType = 'error';
			} else if (status >= 400 && status !== 401) {
				logType = 'warn';
			} else {
				logType = 'info';
			}

			log = {
				proxyRequest: true,
				userId: request._userId,
				httpUrl: url,
				timestamp: timestamp,
				datetime: datetime,
				httpClientIP: '127.0.0.1', // yes, SWA is localhost.
				httpMethod: options.method,
				httpVersion: response.httpVersionMajor + '.' + response.httpVersionMinor,
				httpStatus: status,
				httpStatusName: http.STATUS_CODES[status],
				httpPathAndQuery: options.path,
				httpPath: typeof options.path === 'string' ? options.path.split('?')[0] : options.path,  // options.path includes query
				httpAcceptEncoding: options.headers['accept-encoding'],
				httpUserAgent: options.headers['user-agent'],
				httpVia: response.headers.via,
				httpXForwardedFor: options.headers['x-forwarded-for'],
				httpXRequestedWith: options.headers['x-requested-with'],
				httpXRequestedBy: options.headers['x-requested-by'],
				httpCacheControl: response.headers['cache-control'],
				httpContentLength: +response.headers['content-length'],
				httpWWWAuthenticate: response.headers['www-authenticate'],
				httpApplicationTime: appTime
			};

			if(options.headers.Authorization){
				var shasum = crypto.createHash('sha1');
				shasum.update(options.headers.Authorization, 'utf8');
				log.httpAuthorizationHash = shasum.digest('hex');
			}

			message = [
				'PROXY',
				log.httpMethod,
				log.httpPathAndQuery,
				'returned',
				log.httpStatus,
				log.httpStatusName,
				'in',
				log.httpApplicationTime + 'ms'
			].join(' ');

			if(response instanceof Error){
				// This is actually an error!
				log.stack = response.stack;
				logger.error(message + ' threw ' + response.toString(), log);
				return;
			}

			logger[logType](message, log);
		};

		/**
		 * Will parse the response for the website by setting the headers, handling cookies etc.
		 * Notice: This method will sends data back to the website
		 * @param proxy_response The response object
		 * @private
		 */
		var _parseResponse = function(proxy_response){
			if(res.headersSent){
				return;
			}
			var chunked = proxy_response.headers['transfer-encoding'] === 'chunked';

			var response_headers = {};
			// copy accross headers from proxy response to response
			for (var header in proxy_response.headers) {
				if(proxy_response.headers.hasOwnProperty(header)){
					response_headers[header] = proxy_response.headers[header];
				}
			}

			// transform API services content-type to application/json
			if (proxy_response.headers.hasOwnProperty('content-type')) {
				if (proxy_response.headers['content-type'].indexOf(constants.BBB_CONTENT_TYPE) === 0) {
					response_headers['content-type'] = 'application/json';
				}
			}
			// set status code if chunked
			if(chunked){
				res.writeHead(proxy_response.statusCode, response_headers);
			} else {
				for(var index in response_headers){
					if(response_headers.hasOwnProperty(index)){
						res.setHeader(index, response_headers[index]);
					}
				}
				res.status(proxy_response.statusCode);
			}
			var buffers = [];
			proxy_response.on('data', function (chunk) {
				if (!chunked) {
					buffers.push(chunk);
				} else {
					res.write(chunk);
				}
			});

			proxy_response.on('end', function() {
				if (!chunked) {
					var response_body = Buffer.concat(buffers);
					// If appropriate, translate the authentication OAuth2 bearer token back to a cookie
					if ((req.options.path.indexOf(constants.AUTH_PATH_COMPONENT) !== -1 || req.options.path.indexOf(constants.AUTH_USERS_PATH) !== -1) &&
						proxy_response.headers.hasOwnProperty('content-type') &&
						proxy_response.headers['content-type'].indexOf('application/json') === 0) {
						try {
							var json_response = JSON.parse(String(response_body)),
									old_access_token,
									access_token,
									refresh_token,
									user_id_parts,
									user_id,
									body,
									remember_me,
									expires,
									expiresDate,
									writeResponse;
							if (json_response.hasOwnProperty(constants.AUTH_ACCESS_TOKEN_NAME)) {
								writeResponse = function () {
									// save new access token
									_updateAccessToken(old_access_token, access_token, {
										refresh_token: refresh_token,
										user_id: user_id,
										expires: expires
									});

									res.cookie(constants.AUTH_ACCESS_TOKEN_NAME, access_token, { path: '/api', expires: expiresDate, httpOnly: true, secure: true });

									// Strip the access and refresh tokens from the response body:
									delete json_response[constants.AUTH_REFRESH_TOKEN_NAME];
									delete json_response[constants.AUTH_ACCESS_TOKEN_NAME];

									response_body = JSON.stringify(json_response);
									res.setHeader('Content-Length', Buffer.byteLength(response_body));
									res.write(response_body);
									res.end();
								};

								// response is a refresh token request to the /oauth/token endpoint
								old_access_token = req.cookies[constants.AUTH_ACCESS_TOKEN_NAME];
								access_token = json_response[constants.AUTH_ACCESS_TOKEN_NAME];
								refresh_token = json_response[constants.AUTH_REFRESH_TOKEN_NAME];

								// get the user id from the response
								user_id_parts = json_response.user_id.split(':');
								user_id = user_id_parts[user_id_parts.length - 1];

								body = querystring.parse(req.body) || {};

								remember_me = body[constants.AUTH_PARAM_REMEMBER_ME] === 'true';

								if (!remember_me && !!old_access_token) {
									// Retrieve the expires value stored for the old access token:
									repository.get(old_access_token).then(function (value) {
										try {
											var data = JSON.parse(value);
											expires = data.expires;
											expiresDate = expires ? new Date(expires) : null;
											req._userId = data.user_id;
										} catch (ignore) {}
										writeResponse();
									}, writeResponse); // continue on redis errors
								} else {
									// handle persistent and non-persistent authentication
									expires = remember_me ? Date.now() + constants.AUTH_MAX_AGE : undefined;
									expiresDate = expires ? new Date(expires) : null;
									writeResponse();
								}
								return;
							}
						} catch (e) {
							logger.critical(e);
						}
					}
					res.write(response_body);
				}
				res.end();
			});
		};

		/**
		 * perform a request
		 * @param options request options
		 * @param onSuccess function to call on successful request
		 * @param onError function to call on failure request
		 * @param cookie a cookie to include in the proxy request
		 * @returns {*} return the response object
		 * @private
		 */
		var _request = function (options, onSuccess, onError, cookie) {
			var request = proxy_scheme.request(extend({}, options));

			// Used later in the logProxyRequest method to find out how long the request took
			request.__start_timestamp = Date.now();
			request.__options = extend({}, options);

			request.on('response', function(proxy_response){
				_logProxyRequest(request, proxy_response);
				if (res.headersSent) {
					return;
				}
				// update cookie on success
				if (cookie && proxy_response.statusCode === 200) {
					res.cookie(cookie.name, cookie.value, cookie.prop);
				}
				onSuccess(proxy_response);
			});

			request.on('error', function (err) {
				_logProxyRequest(request, err);
				if (typeof onError === 'function') {
					onError(err);
				}
			});
			return request;
		};

		var _refreshTokenOptions = function(post_data){
			return {
				host: config.domains.auth.options.host,
				path: constants.REFRESH_TOKEN_PATH,
				port: config.domains.auth.options.port,
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Length': Buffer.byteLength(post_data)
				}
			};
		};

		/**
		 * function that refreshes the access token (AT)
		 * @param refresh_token the refresh token to use to get a new AT
		 * @param onSuccess function to call when getting a new AT
		 * @param onError function to call on error
		 * @private
		 */
		var _refreshToken = function(refresh_token, onSuccess, onError){
			var post_data = querystring.stringify({
				refresh_token: refresh_token,
				grant_type: constants.AUTH_REFRESH_TOKEN_NAME
			});
			var obj;
			var post_req = _request(_refreshTokenOptions(post_data), function(response){
				if(response.statusCode === 200){
					response.on('data', function (chunk) {
						try{
							obj = JSON.parse(chunk + '');
						} catch(err){
							if(typeof onError === 'function'){
								onError('Invalid JSON when attempting to parse response body for refresh token');
							}
						}
					});
					response.on('end', function() {
						if(typeof onSuccess === 'function'){
							onSuccess(obj);
						}
					});
				} else {
					if(typeof onError === 'function'){
						onError();
					}
				}
			}, function(error){
				if(typeof onError === 'function'){
					onError(error);
				}
			});
			post_req.write(post_data);
			post_req.end();
		};

		// generic error handler
		var _errorHandler = function (e) {
			if(res.headersSent){
				return;
			}
			var msg = { error: e.message.replace(/\"/g, '') };      // strip any double quotes TODO: should handle single quotes too
			var response = JSON.stringify(msg);
			res.set('Content-Type', 'application/json');
			res.set('Content-length', Buffer.byteLength(response));
			res.send(500, response);
		};

		// make request on behalf of the website
		var proxy_request = _request(req.options,
			// on success
			function(proxy_response){
				// do not continue if the response has already been sent (example timeout)
				if(res.headersSent){
					return;
				}

				// if token invalid/expired
				var error_message = proxy_response.headers['www-authenticate'];
				if(proxy_response.statusCode === 401 && error_message && error_message !== constants.NO_TOKEN){
					logger.info('Access token is invalid, refreshing.');

					// get refresh token for the invalid token
					if(req.options.headers.Authorization){
						var access_token = req.options.headers.Authorization.substr('Bearer '.length);

            logger.info('Attempting to get access token from repository.');
						repository.get(access_token).then(function(value){
							try{
								var obj = JSON.parse(value),
									refresh_token = obj.refresh_token,
									expires = obj.expires,
									user_id = obj.user_id;
								req._userId = user_id;
								// get new access token
								_refreshToken(refresh_token, function(result){
									var new_access_token = result.access_token;

									// save new access token
									_updateAccessToken(access_token, new_access_token, {
										refresh_token: refresh_token,
										user_id: user_id,
										expires: expires
									});

									// update authorization
                  logger.info('Translating access_token to header and making new request.');
									req.options.headers.Authorization = 'Bearer '+ new_access_token;

									// redo the request
									var new_request = _request(req.options, _parseResponse, _errorHandler, {
										name: constants.AUTH_ACCESS_TOKEN_NAME,
										value: new_access_token,
										prop: { expires: expires ? new Date(expires) : null, path: '/api', httpOnly: true, secure: true }
									});
									if (req.method === 'POST'|| req.method === 'PATCH') {
										new_request.write(req.body);
									}
									new_request.end();
								}, function(){
									// refresh token invalid, send back result as is
									_parseResponse(proxy_response);
								});
							} catch(err) {
								// JSON parsing failed, refresh token not found, send back the result as is
								_parseResponse(proxy_response);
							}
						}, function(){
							// Redis error, continue with response
							_parseResponse(proxy_response);
						});
					} else {
						// Token does not exist on the client, sending the response back as is
						_parseResponse(proxy_response);
					}
				} else {
					// everything is ok (200)
					_parseResponse(proxy_response);
				}
			},
			_errorHandler
		);

		// set a timeout handler
		req.on('timeout', function () {
			// cancel any ongoing requests
			proxy_request.abort();
		});

		if (req.method === 'POST'|| req.method === 'PATCH') {
			proxy_request.write(req.body);
		}
		proxy_request.end();
	});

module.exports = router;