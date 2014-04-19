'use strict';

var package_json = require('./../package.json');

module.exports = {
	LOCAL_PATH: '/api/local/',
	APP_NAME: package_json.name,
	APP_VERSION: package_json.version,
	AUTH_ACCESS_TOKEN_NAME : 'access_token',
	SIGN_OUT_PATH: '/signout',
	CLIENT_CONFIG_PATH: '/config'
};