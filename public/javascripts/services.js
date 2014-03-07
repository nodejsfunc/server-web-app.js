'use strict';

/* globals querystring, global, https, http, api_timeout */

// constant variables
global.const = {
	AUTH_ACCESS_TOKEN_NAME : 'access_token',
	AUTH_REFRESH_TOKEN_NAME : 'refresh_token',
	AUTH_PATH_COMPONENT : 'oauth2',
	AUTH_PARAM_REMEMBER_ME : 'remember_me',
	BBB_CONTENT_TYPE : 'application/vnd.blinkboxbooks.data',
	AUTH_MAX_AGE : 1000*60*60*24*14, // 14 days
	REFRESH_TOKEN_PATH: '/oauth2/token',
	LOCAL_PATH : 'local',
	SIGN_OUT_PATH : '/signout',
	CLIENT_CONFIG_PATH: '/config',
	CREDIT_CARD_PATH: '/service/my/creditcards',
	BASKET_PATH: '/service/my/baskets',
	PURCHASE_PATH: '/service/my/payments',
	CLUBCARD_PATH: '/service/my/clubcards',
	CLUBCARD_VALIDATION_PATH: '/service/clubcards/validation',
	LIBRARY_PATH: '/service/my/library',
	ADMIN_PATH: '/service/admin/users/',
	ADMIN_CREDIT_PATH: 'credit',
	EXPIRED_TOKEN: 'The access token expired',
	INVALID_TOKEN: 'Access token is invalid',
  UNVERIFIED_IDENTITY: 'User identity must be reverified'
};

/**
 * Services
 * User: esteban
 * Date: 17/05/2013
 * Time: 12:08
 * To change this template use File | Settings | File Templates.
 */
exports.getResults = function (req, res, options) {

  var proxy_request_body;

  // Build proxy request headers by copying across request headers from client request
  var headers = {};
  for(var header in req.headers) {
    if (req.headers.hasOwnProperty(header)) {
      if (!options.hasOwnProperty(header)) {
        if (header !== 'cookie') {   // don't copy across cookies
          headers[header] = req.headers[header];
        //  console.log(header+' '+req.headers[header]); // uncomment to debug request headers
        }
      }
    }
  }
  // if present, translate access_token cookie to OAuth2 Authorisation header with bearer token
  // NOTE: the node app may be communicating with services behind the same firewall or on a different domain entirely (as is the case with nodejs-internal)
  // so we don't want to add the OAUTH2 header if communicating on port 80
  if (req.cookies.hasOwnProperty(global.const.AUTH_ACCESS_TOKEN_NAME) && options.port !== 80) {
		headers.Authorization = 'Bearer '+ req.cookies[global.const.AUTH_ACCESS_TOKEN_NAME];
  }
	// console.log('COOKIES:'+JSON.stringify(req.cookies)); // uncomment to see cookies in client requset

  if (req.method === 'POST' || req.method === 'PATCH') {
		proxy_request_body = querystring.stringify(req.body);
		headers['content-length'] = proxy_request_body.length;
  }

	var _isCreditCardService = function(){
		return options.host === global.api_domains['secure-service'].options.host && options.path.indexOf(global.const.CREDIT_CARD_PATH) === 0;
	};

	var _isBasketService = function(){
		return options.host === global.api_domains['secure-service'].options.host && options.path.indexOf(global.const.BASKET_PATH) === 0;
	};

	var _isPurchaseService = function(){
		return options.host === global.api_domains['secure-service'].options.host && options.path.indexOf(global.const.PURCHASE_PATH) === 0;
	};

	var _isClubcardService = function(){
		return options.host === global.api_domains['secure-service'].options.host && options.path.indexOf(global.const.CLUBCARD_PATH) === 0;
	};

  var _isClubcardValidationService = function(){
    return options.host === global.api_domains['secure-service'].options.host && options.path.indexOf(global.const.CLUBCARD_VALIDATION_PATH) === 0;
  };

	var _isLibraryService = function(){
		return options.host === global.api_domains['secure-service'].options.host && options.path.indexOf(global.const.LIBRARY_PATH) === 0;
	};

	var _isAdminCreditService = function(){
		return options.host === global.api_domains['secure-service'].options.host && options.path.indexOf(global.const.ADMIN_PATH) === 0 && options.path.indexOf(global.const.ADMIN_CREDIT_PATH) !== -1;
	};

	// the bodyparser of express.js is unable to parse anything other than JSON or form parameters (req.body is empty)
	// to enable custom content-types, that send raw data, we must set the accept header to the desired content-type (set by the request in Accept)
	// this app will replace the content type AFTER the bodyparser received the data in req.body
	// this is only required for POST/PATCH/DELETE

	var _setContentType = function(){
		// change the content type
		headers['content-type'] = req.headers.accept;
		// send data as JSON string, not query string as the default
		proxy_request_body = JSON.stringify(req.body);
		if(req.method === 'PATCH' || req.method === 'POST'){
			headers['content-length'] = proxy_request_body.length;
		}
	};

	if(req.method !== 'GET' && req.headers.accept && _isCreditCardService()){
		_setContentType();
	}

	if(req.method !== 'GET' && req.headers.accept && _isBasketService()){
		_setContentType();
	}

	if(req.method !== 'GET' && req.headers.accept && _isPurchaseService()){
		_setContentType();
	}

	if(req.method !== 'GET' && req.headers.accept && _isClubcardService()){
		_setContentType();
	}

  if(req.method !== 'GET' && req.headers.accept && _isClubcardValidationService()){
    _setContentType();
  }

	if(req.method !== 'GET' && req.headers.accept && _isLibraryService()){
		_setContentType();
	}

	if(req.method !== 'GET' && req.headers.accept && _isAdminCreditService()){
		_setContentType();
	}

	options.headers = headers;
  options.method = req.method; // make the proxy request use the same verb as the client request

	// TODO For testing purposes
	// options.port = 443;
	// options.host = 'auth.mobcastdev.com';
	// options.path = '/users/532';
	// options.headers.Authorization = 'Bearer ' + 'invalid';

  // Make the proxy HTTP request
	var proxy_scheme = options.port === 443 ? https : http;

	var _updateAccessToken = function(oldAT, newAT, value){
		// delete old access token, if it exists
		global.repository.del(oldAT);

		// set the access/refresh token in the key/value store
		global.repository.set(newAT, value);
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
			response_headers[header] = proxy_response.headers[header];
		}
		response_headers['X-Powered-By'] = global.app_name + global.app_version;

		// transform API services content-type to application/json
		if (proxy_response.headers.hasOwnProperty('content-type')) {
			if (proxy_response.headers['content-type'].indexOf(global.const.BBB_CONTENT_TYPE) === 0) {
				response_headers['content-type'] = 'application/json';
			}
		}
    // set status code if chunked
		if(chunked){
			res.writeHead(proxy_response.statusCode, response_headers);
		} else {
			for(var index in response_headers){
				res.setHeader(index, response_headers[index]);
			}
      res.status(proxy_response.statusCode);
		}
		var response_body = '';

    proxy_response.on('data', function (chunk) {
      response_body += chunk;
      if (!chunked) {
        // If appropriate, translate the authentication OAuth2 bearer token back to a cookie
        if (req.path.indexOf(global.const.AUTH_PATH_COMPONENT) !== -1  &&
          proxy_response.headers.hasOwnProperty('content-type') &&
          proxy_response.headers['content-type'].indexOf('application/json') === 0) {
          try {
            var json_response = JSON.parse(response_body);
            if (json_response.hasOwnProperty(global.const.AUTH_ACCESS_TOKEN_NAME)) {
              var access_token = json_response[global.const.AUTH_ACCESS_TOKEN_NAME];
              var refresh_token = json_response[global.const.AUTH_REFRESH_TOKEN_NAME];

              // get the user id from the response
              var user_id = json_response.user_id.split(':');
              user_id = user_id[user_id.length - 1];

              // handle persistent and non-persistent authentication
              var expiresDate = req.param(global.const.AUTH_PARAM_REMEMBER_ME) === 'true' ? new Date(Date.now() + global.const.AUTH_MAX_AGE) : null;
              res.cookie(global.const.AUTH_ACCESS_TOKEN_NAME, access_token, { path: '/api', expires: expiresDate, httpOnly: true, secure: true });

              _updateAccessToken(req.cookies[global.const.AUTH_ACCESS_TOKEN_NAME], access_token, JSON.stringify({refresh_token:refresh_token, user_id: user_id, remember_me: expiresDate !== null}));
            }
          }
          catch (e) {
            console.log('Invalid JSON when attempting to parse response body for auth token');
          }
        }
      }
      res.write(chunk);
    });

		proxy_response.on('end', function() {
			res.end();
		});
	};

	/**
	 * perform a request
	 * @param options request options
	 * @param onSuccess function to call on successful request
	 * @param onError function to call on failure request
	 * @returns {*} return the response object
	 * @private
	 */
	var _request = function(options, onSuccess, onError, cookie){
		var request = proxy_scheme.request(options, function(proxy_response){
			if(res.headersSent){
				return;
			}
			// update cookie on success
			if(cookie && proxy_response.statusCode === 200){
				res.cookie(cookie.name, cookie.value, cookie.prop);
			}
			onSuccess(proxy_response);
		}).on('error', function(err){
			if(typeof onError === 'function'){
				onError(err);
			}
		});
		request.end();
		return request;
	};

	var _refreshTokenOptions = function(post_data){
		return {
			host: global.api_domains.auth.options.host,
			path: global.const.REFRESH_TOKEN_PATH,
			port: global.api_domains.auth.options.port,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': post_data.length
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
		var post_data = global.querystring.stringify({
			refresh_token: refresh_token,
			grant_type: global.const.AUTH_REFRESH_TOKEN_NAME
		});
		var new_access_token = '';
		var post_req = _request(_refreshTokenOptions(post_data), function(response){
			if(response.statusCode === 200){
				response.on('data', function (chunk) {
					try{
						chunk = JSON.parse(chunk + '');
					} catch(err){
						if(typeof onError === 'function'){
							onError('Invalid JSON when attempting to parse response body for refresh token');
						}
					}
					new_access_token = chunk && chunk.access_token ? chunk.access_token : '';
				});
				response.on('end', function() {
					if(typeof onSuccess === 'function'){
						onSuccess(new_access_token);
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
		console.log('error', msg); //uncomment to see error message
		res.set('Content-Type', 'application/json');
		res.set('Content-length', response.length);
		res.send(500, response);
		res.end();
	};
	// console.log(options, proxy_request_body, req.body);
	// make request on behalf of the website
	var proxy_request = _request(options,
		// on success
		function(proxy_response){
			// do not continue if the response has already been sent (example timeout)
			if(res.headersSent){
				return;
			}
			// console.log('response', proxy_response.statusCode);
			// if token invalid/expired
			var error_message = proxy_response.headers['www-authenticate'] || '';
			if(proxy_response.statusCode === 401 && (error_message.indexOf(global.const.INVALID_TOKEN) !== -1 || error_message.indexOf(global.const.EXPIRED_TOKEN) !== -1  || error_message.indexOf(global.const.UNVERIFIED_IDENTITY) !== -1)){
				// get refresh token for the invalid token
				if(options.headers.Authorization){
					var access_token = options.headers.Authorization.substr('Bearer '.length);

					global.repository.get(access_token).then(function(value){
						try{
							var obj = JSON.parse(value),
								refresh_token = obj.refresh_token,
								remember_me = !!obj.remember_me, // convert remember_me to its boolean value
								user_id = obj.user_id;
							// get new access token
							_refreshToken(refresh_token, function(new_access_token){
								// set expiry date
								var expiresDate = remember_me ? new Date(Date.now() + global.const.AUTH_MAX_AGE) : null;

								// save new access token
								_updateAccessToken(access_token, new_access_token, JSON.stringify({refresh_token:refresh_token, user_id: user_id, remember_me: expiresDate !== null}));

								// update authorization
								options.headers.Authorization = 'Bearer '+ new_access_token;

								// redo the request
								_request(options, _parseResponse, _errorHandler, {
									name: global.const.AUTH_ACCESS_TOKEN_NAME,
									value: new_access_token,
									prop: { expires: expiresDate, path: '/api', httpOnly: true, secure: true }
								});
							}, function(){
								// refresh token invalid, send back result as is
								_parseResponse(proxy_response);
							});
						} catch(err) {
							// refresh token not found, send back the result as is
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
  req.socket.removeAllListeners('timeout');
  req.socket.setTimeout(api_timeout * 1000);
  req.socket.on('timeout', function () {
		if(res.headersSent){
			return;
		}

		// return 504 message
		var message = '<html><head><title>504 Gateway Time-out</title></head>'+
			'<body bgcolor="white">'+
			'<center><h1>504 Gateway Time-out</h1></center>'+
			'<hr>'+
		'</body></html>';
		res.send(504, message);
		res.end();

		// cancel any ongoing requests
		proxy_request.abort();
  });
  if (req.method === 'POST'|| req.method === 'PATCH') {
		proxy_request.write(proxy_request_body);
  }
  proxy_request.end();
};
