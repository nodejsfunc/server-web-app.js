'use strict';

/* globals global */

/**
 * Common route
 *
 * Routes all incoming requests
 *
 * @param req
 * @param res
 */
exports.index = function (req, res) {

  // Purpose: given an alias in the URI, map requests to the appropriate domain
  // All requests will start with /api followed by an alias for the domain 
  // The aliases are defined in the environment config file in the /configs directory
  var options = {};
  var pathComponents = req._parsedUrl.pathname.match(/[^//]+/g);  // array of path components

  if (pathComponents.length >= 3) { // we need at least three path components e.g. /api/service/catalogue or /api/auth/oauth2
    var domains = global.api_domains;
    var secondPathComponent = pathComponents[1];
    var thirdPathComponent = pathComponents[2];

    if (domains.hasOwnProperty(secondPathComponent)) { // take the second path component and use it to look up the target domain
      var domain = domains[secondPathComponent];
      options = domain.options;

      if (domain.hasOwnProperty('root') && domain.root.length > 0) {
        // if there is a root, use this as the start of the URI
        options.path = '/'+domain.root+req.url.substring(req.url.indexOf(thirdPathComponent)-1, req.url.length);   // strip off the first and second path component
      }
      else {
        // else start from the third component
				options.path = req.url.substring(req.url.indexOf(thirdPathComponent)-1, req.url.length);   // strip off the first and second path component
      }

			// if path is requesting user details, append user id to url
			if(options.host === domains.auth.options.host &&
				options.path === '/users'){
				if(req.cookies.hasOwnProperty(global.const.AUTH_ACCESS_TOKEN_NAME)){
					var token = req.cookies[global.const.AUTH_ACCESS_TOKEN_NAME];
					global.repository.get(token).then(function(value){ // on success
						try{
							var user_id = JSON.parse(value).user_id;
							options.path += '/' + user_id;
							// make request with user id
							require(global.servicesPath).getResults(req, res, options);
						}catch(e){
							// error retrieving valid data from redis database, continue original request
							res.clearCookie(global.const.AUTH_ACCESS_TOKEN_NAME);
							require(global.servicesPath).getResults(req, res, options);
						}
					}, function(){ // on error
						// error connecting to redis, continue request
						res.clearCookie(global.const.AUTH_ACCESS_TOKEN_NAME);
						require(global.servicesPath).getResults(req, res, options);
					});
				} else {
					// no access token available
					require(global.servicesPath).getResults(req, res, options);
				}
			} else{
				// request options are ready to be handled
				require(global.servicesPath).getResults(req, res, options);
			}
    } else {
			// handle requests that do not require a service call
			if(secondPathComponent === global.const.LOCAL_PATH){
				var path = req.url.substring(req.url.indexOf(thirdPathComponent)-1, req.url.length);   // strip off the first and second path component

        // return server web app version number
        res.setHeader('X-Powered-By', global.app_name + global.app_version);

				if(path === global.const.SIGN_OUT_PATH){
					var access_token = req.cookies[global.const.AUTH_ACCESS_TOKEN_NAME];

					// delete token from redis repository
					global.repository.del(access_token);

					// delete cookie in browser
					res.clearCookie(global.const.AUTH_ACCESS_TOKEN_NAME);

					res.send(200, null);
					res.end();
				} else if(path === global.const.CLIENT_CONFIG_PATH){
					res.send(200, global.clientConfig);
					res.end();
				}
			}
		}
  }
};
