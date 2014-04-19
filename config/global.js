'use strict';

var package_json = require('./../package.json');

module.exports = {
	APP_NAME: package_json.name,
	APP_VERSION: package_json.version,
	AUTH_ACCESS_TOKEN_NAME : 'access_token',
	SIGN_OUT_PATH: '/signout',
	LOCAL_PATH: '/api/local/',
	CLIENT_CONFIG_PATH: '/config',
	CREDIT_CARD_PATH: '/service/my/creditcards',
	BASKET_PATH: '/service/my/baskets',
	PURCHASE_PATH: '/service/my/payments',
	CLUBCARD_PATH: '/service/my/clubcards',
	CLUBCARD_VALIDATION_PATH: '/service/clubcards/validation',
	LIBRARY_PATH: '/service/my/library',
	ADMIN_PATH: '/service/admin/users/',
	ADMIN_CREDIT_PATH: 'credit',
};